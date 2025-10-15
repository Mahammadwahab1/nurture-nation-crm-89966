import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiRequest';
import { Lead, Task, StageHistory, Remark, UniversityApplication } from '@/types/lead';
import { getCurrentUser } from '@/lib/mockAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TaskComposer } from '@/components/TaskComposer';
import { EditLeadModal } from '@/components/EditLeadModal';
import { DocumentsList } from '@/components/DocumentsList';
import { ArrowLeft, Plus, Edit, User, Mail, Phone, MapPin, Calendar, FileText, History, MessageSquare, GraduationCap, Files } from 'lucide-react';

export default function LeadWorkspace() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [showTaskComposer, setShowTaskComposer] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: lead, isLoading: leadLoading } = useQuery<Lead>({
    queryKey: ['/api/leads/', leadId],
    queryFn: () => apiRequest(`/api/leads/${leadId}`),
    enabled: !!leadId,
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['/api/leads/', leadId, '/tasks'],
    queryFn: () => apiRequest(`/api/leads/${leadId}/tasks`),
    enabled: !!leadId,
  });

  const { data: stageHistory = [] } = useQuery<StageHistory[]>({
    queryKey: ['/api/leads/', leadId, '/history'],
    queryFn: () => apiRequest(`/api/leads/${leadId}/history`),
    enabled: !!leadId,
  });

  const { data: remarks = [] } = useQuery<Remark[]>({
    queryKey: ['/api/leads/', leadId, '/remarks'],
    queryFn: () => apiRequest(`/api/leads/${leadId}/remarks`),
    enabled: !!leadId,
  });

  const { data: universities = [] } = useQuery<UniversityApplication[]>({
    queryKey: ['/api/leads/', leadId, '/universities'],
    queryFn: () => apiRequest(`/api/leads/${leadId}/universities`),
    enabled: !!leadId,
  });

  if (leadLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!lead) {
    return <div className="flex items-center justify-center min-h-screen">Lead not found</div>;
  }

  const isAdmin = currentUser?.role === 'admin';
  const backPath = isAdmin ? '/admin/leads' : '/counselor/leads';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(backPath)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{lead.name}</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <span>Lead ID: {lead.id}</span>
                <span>•</span>
                <span>External UID: {lead.uid}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button variant="outline" onClick={() => setShowEditModal(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Lead
              </Button>
            )}
            <Button onClick={() => setShowTaskComposer(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lead Data Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Lead Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Badge className="mb-4">{lead.stage}</Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.country}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Intake: {lead.intake}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>Source: {lead.source}</span>
                </div>
                {lead.counselorName && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Counselor: {lead.counselorName}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(lead.createdAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Last Updated: {new Date(lead.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Area */}
          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              <Tabs defaultValue="tasks" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="remarks">Remarks</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="universities">Universities</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="tasks" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Task History</h3>
                    <Badge variant="secondary">{tasks.length} tasks</Badge>
                  </div>
                  {tasks.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No tasks yet</p>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <Card key={task.id}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <p className="font-medium">{task.taskType}</p>
                                {task.callStatus && (
                                  <p className="text-sm text-muted-foreground">Call: {task.callStatus}</p>
                                )}
                                {task.connectStatus && (
                                  <p className="text-sm text-muted-foreground">Status: {task.connectStatus}</p>
                                )}
                                {task.trackingStatus && (
                                  <p className="text-sm text-muted-foreground">Tracking: {task.trackingStatus}</p>
                                )}
                                {task.remarks && (
                                  <p className="text-sm mt-2">{task.remarks}</p>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(task.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="remarks" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Remarks
                    </h3>
                    <Badge variant="secondary">{remarks.length} remarks</Badge>
                  </div>
                  {remarks.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No remarks yet</p>
                  ) : (
                    <div className="space-y-3">
                      {remarks.map((remark) => (
                        <Card key={remark.id}>
                          <CardContent className="pt-4">
                            <p className="text-sm">{remark.content}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(remark.createdAt).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Stage History
                    </h3>
                    <Badge variant="secondary">{stageHistory.length} changes</Badge>
                  </div>
                  {stageHistory.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No stage changes yet</p>
                  ) : (
                    <div className="space-y-3">
                      {stageHistory.map((history) => (
                        <Card key={history.id}>
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">
                                  {history.fromStage} → {history.toStage}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  By {history.changedBy}
                                </p>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(history.changedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="universities" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      University Applications
                    </h3>
                    <Badge variant="secondary">{universities.length} applications</Badge>
                  </div>
                  {universities.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No university applications yet. Log a tracking task with "Credentials logging" to create one.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {universities.map((uni) => (
                        <Card key={uni.id}>
                          <CardContent className="pt-4">
                            <div className="space-y-1">
                              <p className="font-medium">{uni.universityName}</p>
                              <p className="text-sm text-muted-foreground">{uni.program}</p>
                              <Badge variant="secondary">{uni.status}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Files className="h-5 w-5" />
                      Documents
                    </h3>
                  </div>
                  <DocumentsList leadId={leadId!} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {showTaskComposer && (
        <TaskComposer
          open={showTaskComposer}
          onClose={() => setShowTaskComposer(false)}
          leadId={leadId!}
          currentStage={lead.stage}
        />
      )}

      {showEditModal && isAdmin && (
        <EditLeadModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          lead={lead}
        />
      )}
    </div>
  );
}
