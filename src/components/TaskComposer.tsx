import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiRequest';
import { getNextStageFromTask } from '@/constants/leadStages';
import { useDynamicFilters } from '@/hooks/useDynamicFilters';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/lib/mockAuth';

interface TaskComposerProps {
  open: boolean;
  onClose: () => void;
  leadId: string;
  currentStage: string;
}

const createTaskSchema = (filters: ReturnType<typeof useDynamicFilters>) =>
  z.object({
    taskType: z.string().min(1, 'Task type is required'),
    callStatus: z.string().optional(),
    connectStatus: z.string().optional(),
    notInterestedReason: filters.isNotInterestedReasonRequired
      ? z.string().min(1, 'Reason is required')
      : z.string().optional(),
    trackingStatus: z.string().optional(),
    followUpDate: filters.isFollowUpDateRequired
      ? z.string().min(1, 'Follow-up date is required')
      : z.string().optional(),
    remarks: z.string().optional(),
  });

export function TaskComposer({ open, onClose, leadId, currentStage }: TaskComposerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentUser = getCurrentUser();

  const [taskType, setTaskType] = useState('');
  const [callStatus, setCallStatus] = useState('');
  const [connectStatus, setConnectStatus] = useState('');

  const filters = useDynamicFilters(taskType, callStatus, connectStatus);
  const formSchema = createTaskSchema(filters);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      taskType: '',
      callStatus: '',
      connectStatus: '',
      notInterestedReason: '',
      trackingStatus: '',
      followUpDate: '',
      remarks: '',
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/leads/${leadId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads/', leadId, '/tasks'] });
      if (form.getValues('remarks')) {
        queryClient.invalidateQueries({ queryKey: ['/api/leads/', leadId, '/remarks'] });
      }
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: (newStage: string) => apiRequest(`/api/leads/${leadId}/stage`, {
      method: 'PUT',
      body: JSON.stringify({ stage: newStage, changedBy: currentUser?.id }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads/', leadId] });
      queryClient.invalidateQueries({ queryKey: ['/api/leads/', leadId, '/history'] });
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await createTaskMutation.mutateAsync({ ...data, createdBy: currentUser?.id });

      const nextStage = getNextStageFromTask(
        currentStage,
        data.taskType,
        data.callStatus,
        data.connectStatus,
        data.trackingStatus
      );

      if (nextStage) {
        await updateStageMutation.mutateAsync(nextStage);
      }

      toast({
        title: 'Task Created',
        description: nextStage ? `Lead moved to ${nextStage}` : 'Task logged successfully',
      });

      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="taskType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setTaskType(value);
                      setCallStatus('');
                      setConnectStatus('');
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select task type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Call">Call</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Session">Session</SelectItem>
                      <SelectItem value="Tracking">Tracking</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {filters.showCallStatus && (
              <FormField
                control={form.control}
                name="callStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Call Status</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setCallStatus(value);
                        setConnectStatus('');
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select call status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Call Done">Call Done</SelectItem>
                        <SelectItem value="No Answer">No Answer</SelectItem>
                        <SelectItem value="Busy">Busy</SelectItem>
                        <SelectItem value="Invalid Number">Invalid Number</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {filters.showConnectStatus && (
              <FormField
                control={form.control}
                name="connectStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Connect Status</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setConnectStatus(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select connect status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Interested">Interested</SelectItem>
                        <SelectItem value="Not Interested">Not Interested</SelectItem>
                        <SelectItem value="Call back">Call back</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {filters.showNotInterestedReason && (
              <FormField
                control={form.control}
                name="notInterestedReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Not Interested</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Cost">Cost</SelectItem>
                        <SelectItem value="Timeline">Timeline</SelectItem>
                        <SelectItem value="Location">Location</SelectItem>
                        <SelectItem value="Changed Plans">Changed Plans</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {filters.showFollowUpDate && (
              <FormField
                control={form.control}
                name="followUpDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follow-up Date & Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {filters.showTrackingStatus && (
              <FormField
                control={form.control}
                name="trackingStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tracking Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tracking status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Credentials logging">Credentials logging</SelectItem>
                        <SelectItem value="Application Submitted">Application Submitted</SelectItem>
                        <SelectItem value="Follow-up">Follow-up</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add any additional notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createTaskMutation.isPending}>
                {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
