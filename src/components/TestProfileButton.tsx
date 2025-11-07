// TestProfileButton - Botón temporal para probar perfiles públicos
import { useAuth } from '../contexts/AuthContextSupabase';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

const TestProfileButton: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Link
      to={`/public/${user.id}`}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
    >
      <Eye className="h-4 w-4" />
      <span className="text-sm font-medium">Ver mi perfil público</span>
    </Link>
  );
};

export default TestProfileButton;
