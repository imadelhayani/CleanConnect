// src/pages/Dashboards/MainDashboard.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { useUser } from "@/Hooks/useAuth";

import AdminDashboard from "./Admin/AdminDashboard";
import SweepstarDashboard from "./Sweepstar/SweepstarDashboard";
import ClientDashboard from "./Client/ClientDashboard";
import { ContentLoader } from "@/components/ui/PageLoader";

export default function MainDashboard() {
    const { data: user, isLoading } = useUser();

    if (isLoading) return <ContentLoader />;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    switch (user.role) {
        case "admin":
            return <AdminDashboard />;
        case "sweepstar":
            return <SweepstarDashboard />;
        case "client":
        default:
            return <ClientDashboard />;
    }
}
