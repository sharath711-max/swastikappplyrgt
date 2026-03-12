
import { useAuth } from '../../contexts/AuthContext';

/**
 * A wrapper component that only renders its children if the user has the required role.
 * 
 * @param {Object} props
 * @param {string|string[]} props.roles - Required role(s). If array, user must have ANY of the roles.
 * @param {React.ReactNode} props.children - The content to hide/show.
 * @param {React.ReactNode} props.fallback - Optional content to show if access is denied (default: null).
 */
const ProtectedComponent = ({ roles, children, fallback = null }) => {
    const { user } = useAuth();

    if (!user) return fallback;

    const userRole = user.role || 'staff';
    const requiredRoles = Array.isArray(roles) ? roles : [roles];

    // normalize for comparison safety
    const hasRole = requiredRoles.some(role => role.toLowerCase() === userRole.toLowerCase());

    return hasRole ? children : fallback;
};

export default ProtectedComponent;
