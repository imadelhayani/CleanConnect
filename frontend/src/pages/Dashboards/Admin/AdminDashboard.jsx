import React, { useState } from "react";
import {
    Activity,
    Download,
    Users,
    Star,
    Calendar,
    DollarSign,
    Loader2,
} from "lucide-react";

import { useUser } from "@/Hooks/useAuth";
import { useDashboard } from "@/Hooks/useDashboard";
import { useAllBookings } from "@/Hooks/useBookings";

import { Button } from "@/components/ui/button";
import StatCard from "./components/StatCard";
import RecentActivity from "./components/RecentActivity";
import SystemStatus from "./components/SystemStatus";
import BookingDetailModal from "@/pages/Admin/Bookings/components/BookingDetailModal";

export default function AdminDashboard() {
    const { data: user } = useUser();
    const { adminStats, isAdminLoading } = useDashboard();
    const { data: allBookings = [] } = useAllBookings();
    const [selectedBooking, setSelectedBooking] = useState(null);

    const handleViewBooking = (partialBooking) => {
        const fullDetails = allBookings.find((b) => b.id === partialBooking.id);
        setSelectedBooking(fullDetails || partialBooking);
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount || 0);

    if (isAdminLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground text-lg">
                        Loading dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-4 md:p-6 max-w-7xl mx-auto">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-primary/8 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent p-8 md:p-12">
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/15 rounded-full blur-3xl dark:bg-primary/10" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl dark:bg-primary/5" />
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/80 border mb-6">
                        <Activity className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Analytics</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Admin Dashboard
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        Welcome back,{" "}
                        <span className="font-semibold text-foreground">
                            {user?.name || "Admin"}
                        </span>
                    </p>
                </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end">
                <Button className="rounded-lg gap-2 bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg h-10 px-6 font-semibold">
                    <Download className="w-4 h-4" />
                    Download Report
                </Button>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Clients"
                    value={adminStats?.data.total_clients || 0}
                    icon={Users}
                    colorClass="bg-blue-500/20 text-blue-600"
                    description="Active accounts"
                />
                <StatCard
                    title="Total Sweepstars"
                    value={adminStats?.data.total_sweepstars || 0}
                    icon={Star}
                    colorClass="bg-purple-500/20 text-purple-600"
                    description="Verified workers"
                />
                <StatCard
                    title="Active Bookings"
                    value={adminStats?.data.active_bookings || 0}
                    icon={Calendar}
                    colorClass="bg-amber-500/20 text-amber-600"
                    description="Pending or confirmed"
                />
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(adminStats?.data.revenue)}
                    icon={DollarSign}
                    colorClass="bg-emerald-500/20 text-emerald-600"
                    description="Completed jobs"
                />
            </div>

            {/* Secondary Widgets */}
            <div className="grid gap-6 md:grid-cols-3">
                <RecentActivity
                    recentActivity={adminStats?.data.recent_activity || []}
                    formatCurrency={formatCurrency}
                    onViewBooking={handleViewBooking}
                />
                <SystemStatus adminStats={adminStats} />
            </div>

            <BookingDetailModal
                booking={selectedBooking}
                open={!!selectedBooking}
                onClose={() => setSelectedBooking(null)}
            />
        </div>
    );
}
