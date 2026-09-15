import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { TicketListPage } from './features/tickets/TicketListPage';
import { CreateTicketPage } from './features/tickets/CreateTicketPage';
import { TicketDetailPage } from './features/tickets/TicketDetailPage';
import { AssetListPage } from './features/assets/AssetListPage';
import { AssetDetailPage } from './features/assets/AssetDetailPage';
import { KnowledgeBasePage } from './features/knowledge/KnowledgeBasePage';
import { NotificationsPage } from './features/notifications/NotificationsPage';
import { UserManagementPage } from './features/users/UserManagementPage';
import { TeamManagementPage } from './features/teams/TeamManagementPage';
import { SLAPoliciesPage } from './features/sla/SLAPoliciesPage';
import { ReportsAnalyticsPage } from './features/reports/ReportsAnalyticsPage';
import { AuditLogsPage } from './features/audit/AuditLogsPage';
import { SystemSettingsPage } from './features/settings/SystemSettingsPage';
import './styles/index.css';
const queryClient = new QueryClient();
function AppRoutes() {
    const { isAuthenticated, loading } = useAuth();
    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }
    return (<Routes>
      {/* Public Routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/"/> : <LoginPage />}/>
      <Route path="/register" element={isAuthenticated ? <Navigate to="/"/> : <RegisterPage />}/>

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>}/>

      {/* Ticket Routes */}
      <Route path="/tickets" element={<ProtectedRoute>
            <AppLayout>
              <TicketListPage />
            </AppLayout>
          </ProtectedRoute>}/>
      <Route path="/tickets/create" element={<ProtectedRoute>
            <AppLayout>
              <CreateTicketPage />
            </AppLayout>
          </ProtectedRoute>}/>
      <Route path="/tickets/:id" element={<ProtectedRoute><AppLayout><TicketDetailPage /></AppLayout></ProtectedRoute>}/>

      {/* Asset Routes */}
      <Route path="/assets" element={<ProtectedRoute requiredRoles={['admin', 'it_manager', 'asset_manager', 'technician']}>
            <AppLayout>
              <AssetListPage />
            </AppLayout>
          </ProtectedRoute>}/>
      <Route path="/assets/:id" element={<ProtectedRoute requiredRoles={['admin', 'it_manager', 'asset_manager', 'technician']}><AppLayout><AssetDetailPage /></AppLayout></ProtectedRoute>}/>

      {/* Knowledge Base */}
      <Route path="/knowledge-base" element={<ProtectedRoute><AppLayout><KnowledgeBasePage /></AppLayout></ProtectedRoute>}/>

      {/* Notifications */}
      <Route path="/notifications" element={<ProtectedRoute><AppLayout><NotificationsPage /></AppLayout></ProtectedRoute>}/>

      {/* User Management - Admin & IT Manager */}
      <Route path="/users" element={<ProtectedRoute requiredRoles={['admin', 'it_manager']}><AppLayout><UserManagementPage /></AppLayout></ProtectedRoute>}/>

      {/* Teams & Departments - Admin & IT Manager */}
      <Route path="/teams" element={<ProtectedRoute requiredRoles={['admin', 'it_manager']}><AppLayout><TeamManagementPage /></AppLayout></ProtectedRoute>}/>

      {/* SLA Policies - Admin & IT Manager */}
      <Route path="/sla" element={<ProtectedRoute requiredRoles={['admin', 'it_manager']}><AppLayout><SLAPoliciesPage /></AppLayout></ProtectedRoute>}/>

      {/* Reports & Analytics - Admin, IT Manager, Technician */}
      <Route path="/reports" element={<ProtectedRoute requiredRoles={['admin', 'it_manager', 'technician']}><AppLayout><ReportsAnalyticsPage /></AppLayout></ProtectedRoute>}/>

      {/* Audit Logs - Admin & IT Manager */}
      <Route path="/audit-logs" element={<ProtectedRoute requiredRoles={['admin', 'it_manager']}><AppLayout><AuditLogsPage /></AppLayout></ProtectedRoute>}/>

      {/* System Settings - Admin only */}
      <Route path="/settings" element={<ProtectedRoute requiredRoles={['admin']}><AppLayout><SystemSettingsPage /></AppLayout></ProtectedRoute>}/>

      {/* Profile placeholder - redirect to dashboard for now */}
      <Route path="/profile" element={<Navigate to="/" replace/>}/>

      {/* Redirect unknown routes to dashboard */}
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>);
}
function App() {
    return (<QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </QueryClientProvider>);
}
export default App;
