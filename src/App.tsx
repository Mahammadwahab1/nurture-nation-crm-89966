import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import CounselorDashboard from "./pages/CounselorDashboard";
import AdminLeads from "./pages/AdminLeads";
import CounselorLeads from "./pages/CounselorLeads";
import LeadWorkspace from "./pages/LeadWorkspace";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/leads"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLeads />
              </ProtectedRoute>
            }
          />
          
          {/* Counselor Routes */}
          <Route
            path="/counselor/dashboard"
            element={
              <ProtectedRoute requiredRole="counselor">
                <CounselorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/counselor/leads"
            element={
              <ProtectedRoute requiredRole="counselor">
                <CounselorLeads />
              </ProtectedRoute>
            }
          />
          
          {/* Shared Lead Workspace */}
          <Route
            path="/lead/:leadId"
            element={
              <ProtectedRoute>
                <LeadWorkspace />
              </ProtectedRoute>
            }
          />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
