import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RosterProvider } from './context/RosterContext';
import { LoginPage } from './pages/LoginPage';
import { AttendancePage } from './pages/AttendancePage';

function AppContent() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AttendancePage /> : <LoginPage />;
}

export function App() {
  return (
    <AuthProvider>
      <RosterProvider>
        <AppContent />
        <Toaster position="top-center" />
      </RosterProvider>
    </AuthProvider>
  );
}
