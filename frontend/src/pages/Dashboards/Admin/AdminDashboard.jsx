import React, { useState } from "react";
import {
    Activity,
    Download,
    Users,
    Star,
    Calendar,
    DollarSign,
} from "lucide-react";
import { useUser } from "@/Hooks/useAuth";
import { useDashboard } from "@/Hooks/useDashboard";
import { useBookingDetail } from "@/Hooks/useBookings";
import { Button } from "@/components/ui/button";
import StatCard from "./components/StatCard";
import RecentActivity from "./components/RecentActivity";
import SystemStatus from "./components/SystemStatus";
import BookingDetailModal from "@/pages/Admin/Bookings/components/BookingDetailModal";
import { ContentLoader } from "@/components/ui/PageLoader";

export default function AdminDashboard() {
    const { data: user } = useUser();
    const { adminStats, isAdminLoading } = useDashboard();
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const { data: selectedBooking, isLoading: isLoadingBooking } =
        useBookingDetail(selectedBookingId);

    if (isAdminLoading) return <ContentLoader />;

    const handleViewBooking = (partialBooking) =>
        setSelectedBookingId(partialBooking.id);
    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount || 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-4 md:p-6 max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-primary/8 to-transparent p-8 md:p-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/80 border mb-6">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Analytics</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                    Admin Dashboard
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                    Welcome back,{" "}
                    <span className="font-semibold text-foreground">
                        {user?.name || "Admin"}
                    </span>
                </p>
            </div>
            <div className="flex justify-end">
                <Button className="rounded-lg gap-2">
                    <Download className="w-4 h-4" /> Download Report
                </Button>
            </div>
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
                open={!!selectedBookingId && !isLoadingBooking}
                onClose={() => setSelectedBookingId(null)}
            />
        </div>
    );
}
