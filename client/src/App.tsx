import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Users from "@/pages/Users";
import Services from "@/pages/Services";
import WorkOrders from "@/pages/WorkOrders";
import Chat from "@/pages/Chat";
import Reports from "@/pages/Reports";
import Profile from "@/pages/Profile";

function AppLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={style}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <Header />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  // Redirect to dashboard if already logged in and trying to access login/register
  if (isAuthenticated && (location === '/login' || location === '/register' || location === '/')) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/dashboard">
        <ProtectedRoute>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/users">
        <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
          <AppLayout>
            <Users />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/services">
        <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
          <AppLayout>
            <Services />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/work-orders">
        <ProtectedRoute>
          <AppLayout>
            <WorkOrders />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/chat">
        <ProtectedRoute>
          <AppLayout>
            <Chat />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/reports">
        <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
          <AppLayout>
            <Reports />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/profile">
        <ProtectedRoute>
          <AppLayout>
            <Profile />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/">
        <Redirect to={isAuthenticated ? "/dashboard" : "/login"} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
