// import React, { useEffect } from "react";
// import { Navigate, Outlet, useLocation } from "react-router-dom";
// import { Loader2 } from "lucide-react";
// import { useUser } from "@/Hooks/useAuth"; // Update this path to where you saved the useUser hook

// export default function RoleRoute({ requiredRole }) {
//     const location = useLocation();

//     // 1. Check LocalStorage immediately (Fast check)
//     // We do this to avoid waiting for the hook if we already know they are a guest.
//     const isStoredAuth =
//         window.localStorage.getItem("Authenticated") === "true";

//     // 2. Fetch User Data from your Hook
//     const { data: user, isLoading, isError } = useUser();

//     // 3. CASE: Guest trying to access protected route
//     if (!isStoredAuth) {
//         return <Navigate to="/login" state={{ from: location }} replace />;
//     }

//     // 4. CASE: Logged in, but fetching user data (Loading)
//     if (isLoading) {
//         return (
//             <div className="flex h-[80vh] items-center justify-center">
//                 <Loader2 className="h-10 w-10 animate-spin text-primary" />
//             </div>
//         );
//     }

//     // 5. CASE: Fetch failed (Token expired or Invalid)
//     // The useUser hook handles the 401 side-effects, but we ensure redirection here.
//     if (isError || !user) {
//         return <Navigate to="/login" state={{ from: location }} replace />;
//     }

//     // 6. CASE: User Logged in, Check Role Permission
//     if (requiredRole && user.role !== requiredRole) {
//         // User is legit, but doesn't have the right role (e.g. Client trying to see Admin page)
//         // Send them to their Dashboard to avoid 403 errors.
//         return <Navigate to="/dashboard" replace />;
//     }

//     // 7. SUCCESS: Render the page
//     return <Outlet />;
// }
// src/router/RoleRoute.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "@/Hooks/useAuth";
import { ContentLoader } from "@/components/ui/PageLoader";

export default function RoleRoute({ requiredRole }) {
    const location = useLocation();
    const { data: user, isLoading, isError } = useUser();

    // 1. Loading state
    if (isLoading) {
        return <ContentLoader />;
    }

    // 2. Not authenticated or error fetching user → go to login
    if (isError || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Authenticated but wrong role → send to own dashboard
    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/dashboard" replace />;
    }

    // 4. OK → render protected content
    return <Outlet />;
}
