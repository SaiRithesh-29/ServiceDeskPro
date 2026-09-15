import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
export function ProtectedRoute({ children, requiredRoles }) {
    const { isAuthenticated, user, loading } = useAuth();
    if (loading) {
        return <LoadingSkeleton count={3}/>;
    }
    if (!isAuthenticated) {
        return <Navigate to="/login" replace/>;
    }
    if (requiredRoles && !requiredRoles.includes(user?.role || '')) {
        return <Navigate to="/" replace/>;
    }
    return <>{children}</>;
}
