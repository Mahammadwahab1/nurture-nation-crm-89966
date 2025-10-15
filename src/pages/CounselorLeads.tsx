import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiRequest';
import { LEAD_STAGES } from '@/constants/leadStages';
import { Lead } from '@/types/lead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Clock } from 'lucide-react';
import { getCurrentUser } from '@/lib/mockAuth';

const getPriorityStatus = (updatedAt: string) => {
  const lastContact = new Date(updatedAt);
  const now = new Date();
  const daysSinceContact = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceContact > 7) {
    return { status: 'Overdue', className: 'bg-destructive text-destructive-foreground' };
  } else if (daysSinceContact > 3) {
    return { status: 'Due Soon', className: 'bg-accent text-accent-foreground' };
  }
  return { status: 'Current', className: 'bg-secondary text-secondary-foreground' };
};

export default function CounselorLeads() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [selectedStage, setSelectedStage] = useState<string>('all');

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ['/api/leads', currentUser?.id],
    queryFn: () => apiRequest(`/api/leads?counselorId=${currentUser?.id}`),
    enabled: !!currentUser?.id,
  });

  const filteredLeads = selectedStage === 'all'
    ? leads
    : leads.filter((lead) => lead.stage === selectedStage);

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    const aPriority = getPriorityStatus(a.updatedAt);
    const bPriority = getPriorityStatus(b.updatedAt);
    const priorityOrder = { Overdue: 0, 'Due Soon': 1, Current: 2 };
    return priorityOrder[aPriority.status as keyof typeof priorityOrder] - 
           priorityOrder[bPriority.status as keyof typeof priorityOrder];
  });

  if (!currentUser || currentUser.role !== 'counselor') {
    return <div>Access Denied</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/counselor/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Users className="h-8 w-8" />
                My Leads
              </h1>
              <p className="text-muted-foreground">Manage your assigned leads</p>
            </div>
          </div>
        </div>

        {/* Stage Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Filter by Stage:</span>
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {LEAD_STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Leads ({sortedLeads.length})</CardTitle>
            <CardDescription>
              Prioritized by last contact date
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading leads...</div>
            ) : sortedLeads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No leads assigned yet</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Priority</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Last Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedLeads.map((lead) => {
                    const priority = getPriorityStatus(lead.updatedAt);
                    return (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <Badge className={priority.className}>{priority.status}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>{lead.phone}</TableCell>
                        <TableCell>{lead.country}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{lead.stage}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(lead.updatedAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => navigate(`/lead/${lead.id}`)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
