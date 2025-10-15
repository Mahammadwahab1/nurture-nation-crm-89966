import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, AlertCircle, CheckCircle2, Clock, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '@/lib/mockAuth';

const CounselorDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const stats = [
    { label: 'My Total Leads', value: '48', icon: Users, color: 'text-primary' },
    { label: 'Needs Attention', value: '8', icon: AlertCircle, color: 'text-accent' },
    { label: 'Active Applications', value: '12', icon: FileText, color: 'text-primary' },
    { label: 'This Month', value: '5', icon: CheckCircle2, color: 'text-green-600' },
  ];

  const pipelineStages = [
    { stage: 'Yet to Assign', count: 0 },
    { stage: 'Cold Lead', count: 5 },
    { stage: 'Session Scheduled', count: 3 },
    { stage: 'Session Done', count: 8 },
    { stage: 'Not Interested', count: 2 },
    { stage: 'Interested', count: 12 },
    { stage: 'Shortlisted Univ.', count: 6 },
    { stage: 'Application Processing', count: 4 },
  ];

  const recentLeads = [
    { id: 1, name: 'Sarah Johnson', stage: 'Session Scheduled', updated: '2 hours ago', priority: 'high' },
    { id: 2, name: 'Mike Chen', stage: 'Documents Submitted', updated: '5 hours ago', priority: 'medium' },
    { id: 3, name: 'Emily Davis', stage: 'Interested', updated: '1 day ago', priority: 'medium' },
    { id: 4, name: 'James Wilson', stage: 'Shortlisted Univ.', updated: '2 days ago', priority: 'low' },
    { id: 5, name: 'Anna Martinez', stage: 'Session Done', updated: '3 days ago', priority: 'high' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Global Connect CRM</h1>
              <p className="text-xs text-muted-foreground">Counselor Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}!</h2>
          <p className="text-muted-foreground">Manage your assigned leads and track your progress.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-10 w-10 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lead Pipeline */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Lead Pipeline</CardTitle>
              <CardDescription>Your leads by stage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pipelineStages.map((stage) => (
                  <div key={stage.stage} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                    <span className="text-sm">{stage.stage}</span>
                    <span className="text-sm font-semibold bg-primary/10 text-primary px-2 py-1 rounded">
                      {stage.count}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Leads */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Leads</CardTitle>
                  <CardDescription>Your most recently updated leads</CardDescription>
                </div>
                <Button onClick={() => navigate('/counselor/leads')}>View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/counselor/leads/${lead.id}`)}
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${
                        lead.priority === 'high'
                          ? 'bg-red-500'
                          : lead.priority === 'medium'
                          ? 'bg-accent'
                          : 'bg-green-500'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.stage}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {lead.updated}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CounselorDashboard;
