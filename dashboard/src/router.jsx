import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage              from './pages/auth/LoginPage';
import Layout                 from './components/ui/Layout';
import DashboardPage          from './pages/dashboard/DashboardPage';
import DemandesPage           from './pages/dashboard/DemandesPage';
import EtudiantsPage          from './pages/dashboard/EtudiantsPage';
import TypesDemandesPage      from './pages/dashboard/TypesDemandesPage';
import DocumentsRequisPage    from './pages/dashboard/DocumentsRequisPage';
import NotificationsAdminPage from './pages/dashboard/NotificationsAdminPage';
import AdminsPage             from './pages/dashboard/AdminsPage';
import ParametresPage         from './pages/dashboard/ParametresPage';
import ProfilAdminPage        from './pages/dashboard/ProfilAdminPage';

function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A1F2E' }}>
      <div style={{ color: '#C0392B', fontSize: 18 }}>Chargement...</div>
    </div>
  );
  return admin ? children : <Navigate to="/login" />;
}

// Redirige un admin vers sa première page autorisée
function AdminRedirect() {
  const { admin } = useAuth();
  if (!admin) return <Navigate to="/login" />;
  if (admin.role === 'super_admin') return <DashboardPage />;

  try {
    const perms = admin.permissions ? JSON.parse(admin.permissions) : [];
    if (perms.includes('demandes'))        return <Navigate to="/demandes" replace />;
    if (perms.includes('etudiants'))       return <Navigate to="/etudiants" replace />;
    if (perms.includes('types_documents')) return <Navigate to="/types-demandes" replace />;
  } catch {}

  return <Navigate to="/notifications" replace />;
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      { index: true,                element: <AdminRedirect /> },
      { path: 'demandes',           element: <DemandesPage /> },
      { path: 'etudiants',          element: <EtudiantsPage /> },
      { path: 'types-demandes',     element: <TypesDemandesPage /> },
      { path: 'documents-requis',   element: <DocumentsRequisPage /> },
      { path: 'notifications',      element: <NotificationsAdminPage /> },
      { path: 'admins',             element: <AdminsPage /> },
      { path: 'parametres',         element: <ParametresPage /> },
      { path: 'profil',             element: <ProfilAdminPage /> },
    ],
  },
]);