// src/pages/ChangePasswordPage.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ChangePasswordModal from '@/components/ChangePasswordModal';

/**
 * Página de cambio de contraseña obligatorio
 * Se muestra cuando must_change_password es true
 */
const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, mustChangePassword } = useAuth();

  // Redirigir si no está autenticado o si ya cambió la contraseña
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (!mustChangePassword && user) {
      // Redirigir según el rol
      switch (user.role) {
        case 'student':
          navigate('/dashboard/student');
          break;
        case 'teacher':
          navigate('/seleccionar-nivel');
          break;
        case 'parent':
          navigate('/dashboard/parent');
          break;
        case 'admin':
        case 'director_general':
        case 'director_academico':
          navigate('/dashboard/admin');
          break;
        default:
          navigate('/');
      }
    }
  }, [isAuthenticated, mustChangePassword, user, navigate]);

  const handleSuccess = () => {
    // Después de cambiar la contraseña, redirigir según rol
    if (user) {
      switch (user.role) {
        case 'student':
          navigate('/dashboard/student');
          break;
        case 'teacher':
          navigate('/seleccionar-nivel');
          break;
        case 'parent':
          navigate('/dashboard/parent');
          break;
        case 'admin':
        case 'director_general':
        case 'director_academico':
          navigate('/dashboard/admin');
          break;
        default:
          navigate('/');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <ChangePasswordModal
        isOpen={true}
        onSuccess={handleSuccess}
        isFirstLogin={true}
      />
    </div>
  );
};

export default ChangePasswordPage;
