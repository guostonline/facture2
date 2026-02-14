import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { type ReactNode } from "react";

interface ProtectedRouteProps {
    children?: ReactNode;
    allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
    const { user, profile, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If roles are specified and profile is loaded but role doesn't match
    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
        return <Navigate to="/" replace />; // Redirect to home or unauthorized page
    }

    return children ? <>{children}</> : <Outlet />;
};
