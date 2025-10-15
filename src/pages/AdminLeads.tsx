import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiRequest';
import { LEAD_STAGES } from '@/constants/leadStages';
import { Lead } from '@/types/lead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Users, Filter, UserPlus } from 'lucide-react';
import { getCurrentUser } from '@/lib/mockAuth';

export default function AdminLeads() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentUser = getCurrentUser();

  const [selectedStages, setSelectedStages] = useState<string[]>(['Yet to Assign']);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedIntake, setSelectedIntake] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedCounselor, setSelectedCounselor] = useState<string>('all');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showAssignUI, setShowAssignUI] = useState(false);
  const [assignToCounselor, setAssignToCounselor] = useState<string>('');

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ['/api/leads'],
    queryFn: () => apiRequest('/api/leads'),
  });

  const { data: counselors = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ['/api/users/counselors'],
    queryFn: () => apiRequest('/api/users/counselors'),
  });

  const bulkAssignMutation = useMutation({
    mutationFn: (data: { leadIds: string[]; counselorId: string }) =>
      apiRequest('/api/leads/assign-bulk', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      toast({ title: 'Success', description: 'Leads assigned successfully' });
      setSelectedLeads([]);
      setShowAssignUI(false);
      setAssignToCounselor('');
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to assign leads', variant: 'destructive' });
    },
  });

  // Extract unique filter values
  const countries = Array.from(new Set(leads.map((l) => l.country).filter(Boolean)));
  const intakes = Array.from(new Set(leads.map((l) => l.intake).filter(Boolean)));
  const sources = Array.from(new Set(leads.map((l) => l.source).filter(Boolean)));

  // Apply filters
  const filteredLeads = leads.filter((lead) => {
    if (selectedStages.length > 0 && !selectedStages.includes(lead.stage)) return false;
    if (selectedCountry !== 'all' && lead.country !== selectedCountry) return false;
    if (selectedIntake !== 'all' && lead.intake !== selectedIntake) return false;
    if (selectedSource !== 'all' && lead.source !== selectedSource) return false;
    if (selectedCounselor === 'unassigned' && lead.counselorId) return false;
    if (selectedCounselor !== 'all' && selectedCounselor !== 'unassigned' && lead.counselorId !== selectedCounselor) return false;
    return true;
  });

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map((l) => l.id));
    }
  };

  const handleBulkAssign = () => {
    if (!assignToCounselor || selectedLeads.length === 0) {
      toast({ title: 'Error', description: 'Please select counselor and leads', variant: 'destructive' });
      return;
    }
    bulkAssignMutation.mutate({ leadIds: selectedLeads, counselorId: assignToCounselor });
  };

  const toggleStage = (stage: string) => {
    setSelectedStages((prev) =>
      prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage]
    );
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return <div>Access Denied</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Users className="h-8 w-8" />
                Lead Management
              </h1>
              <p className="text-muted-foreground">Manage and assign leads to counselors</p>
            </div>
          </div>
          {selectedLeads.length > 0 && (
            <Button onClick={() => setShowAssignUI(!showAssignUI)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Selected ({selectedLeads.length})
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Multi-Select Stage Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start">
                    Stages ({selectedStages.length})
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search stages..." />
                    <CommandEmpty>No stages found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {LEAD_STAGES.map((stage) => (
                        <CommandItem key={stage} onSelect={() => toggleStage(stage)}>
                          <Checkbox
                            checked={selectedStages.includes(stage)}
                            className="mr-2"
                          />
                          {stage}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>

              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedIntake} onValueChange={setSelectedIntake}>
                <SelectTrigger>
                  <SelectValue placeholder="Intake" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Intakes</SelectItem>
                  {intakes.map((intake) => (
                    <SelectItem key={intake} value={intake}>
                      {intake}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {sources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCounselor} onValueChange={setSelectedCounselor}>
                <SelectTrigger>
                  <SelectValue placeholder="Counselor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Counselors</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {counselors.map((counselor) => (
                    <SelectItem key={counselor.id} value={counselor.id}>
                      {counselor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Assignment UI */}
        {showAssignUI && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Select value={assignToCounselor} onValueChange={setAssignToCounselor}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select counselor" />
                  </SelectTrigger>
                  <SelectContent>
                    {counselors.map((counselor) => (
                      <SelectItem key={counselor.id} value={counselor.id}>
                        {counselor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleBulkAssign} disabled={bulkAssignMutation.isPending}>
                  {bulkAssignMutation.isPending ? 'Assigning...' : 'Confirm Assignment'}
                </Button>
                <Button variant="outline" onClick={() => setShowAssignUI(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>Leads ({filteredLeads.length})</CardTitle>
            <CardDescription>
              {selectedLeads.length > 0
                ? `${selectedLeads.length} lead(s) selected`
                : 'Select leads to assign to counselors'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading leads...</div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No leads found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedLeads.length === filteredLeads.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Intake</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Counselor</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedLeads.includes(lead.id)}
                          onCheckedChange={() => toggleLeadSelection(lead.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.country}</TableCell>
                      <TableCell>{lead.intake}</TableCell>
                      <TableCell>{lead.source}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{lead.stage}</Badge>
                      </TableCell>
                      <TableCell>{lead.counselorName || 'Unassigned'}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/lead/${lead.id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
