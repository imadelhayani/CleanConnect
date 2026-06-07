// src/layout/MasterLayout.jsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavBar from "./NavBar/NavBar";
import Sidebar from "./NavBar/SideBar";
import { useUser } from "@/Hooks/useAuth";
import { ContentLoader } from "@/components/ui/PageLoader";

export default function MasterLayout() {
    const { data: user, isLoading } = useUser();
    const location = useLocation();

    const isDashboard = location.pathname.startsWith("/dashboard");

    if (isLoading) return <ContentLoader />;

    return (
        <div className="min-h-screen flex flex-col">
            {/* Top navbar on all pages */}
            <NavBar user={user} />

            {isDashboard ? (
                // Dashboard layout: sidebar + main area
                <main className="flex flex-1">
                    <div className="w-64 border-r bg-muted">
                        <Sidebar />
                    </div>
                    <div className="flex-1">
                        <Outlet />
                    </div>
                </main>
            ) : (
                // Non-dashboard pages: full width
                <main className="flex-1">
                    <Outlet />
                </main>
            )}
        </div>
    );
}
