import React from "react";
import { useNavigate } from "react-router-dom";
import {
    Sparkles,
    ArrowRight,
    Calendar,
    ShieldCheck,
    Heart,
    Zap,
    Award,
    Wallet,
    MapPin,
    Loader2,
} from "lucide-react";
import { useUser } from "@/Hooks/useAuth";
import { useDashboard } from "@/Hooks/useDashboard";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import TrustFeatureCard from "./components/TrustFeatureCard";
import MemberFooter from "./components/MemberFooter";
import StatCard from "./components/StatCard";
import DisabledOverlay from "@/pages/auth/DisabledOverlay";
import { ContentLoader } from "@/components/ui/PageLoader";

export default function ClientDashboard() {
    const { data: user } = useUser();
    const { clientStats, isClientLoading } = useDashboard();
    const navigate = useNavigate();

    if (isClientLoading) return <ContentLoader />;
    if (user?.status === "disabled") return <DisabledOverlay />;

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount || 0);
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent p-8 md:p-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/80 border mb-6">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">
                        Your cleaning companion
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                    {getGreeting()}, {user?.name?.split(" ")[0] || "there"}! 👋
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">
                    Your trusted partner for spotless spaces. Book a cleaning
                    and let us make your home shine.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Button
                        size="lg"
                        className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:shadow-xl"
                        onClick={() => navigate("/dashboard/booking_service")}
                    >
                        <Sparkles className="w-4 h-4" />
                        Book a Cleaning Now
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="gap-2"
                        onClick={() => navigate("/dashboard/bookings_history")}
                    >
                        <Calendar className="w-4 h-4" />
                        View Booking History
                    </Button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Active Bookings"
                    value={clientStats?.data.active_bookings || 0}
                    description="Scheduled cleanings waiting for you"
                    icon={Calendar}
                    onClick={() => navigate("/dashboard/bookings_history")}
                    highlight={clientStats?.data.active_bookings > 0}
                />
                <StatCard
                    title="Saved Addresses"
                    value={clientStats?.data.address_count || 0}
                    description="Locations ready for instant booking"
                    icon={MapPin}
                    onClick={() => navigate("/dashboard/my_addresses")}
                />
                <StatCard
                    title="Total Spent"
                    value={formatCurrency(clientStats?.data.total_spent)}
                    description={`${clientStats?.data.total_bookings || 0} cleanings completed`}
                    icon={Wallet}
                    onClick={() => navigate("/dashboard/bookings_history")}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TrustFeatureCard
                    icon={ShieldCheck}
                    title="Verified Professionals"
                    description="Every cleaner is background-checked and rated"
                    color="green"
                />
                <TrustFeatureCard
                    icon={Heart}
                    title="Happiness Guaranteed"
                    description="Not satisfied? We’ll make it right — no questions asked"
                    color="red"
                />
                <TrustFeatureCard
                    icon={Zap}
                    title="Fast & Secure"
                    description="Instant booking, secure payments, real-time tracking"
                    color="blue"
                />
            </div>
            {clientStats?.data.total_bookings === 0 && (
                <Alert className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-6 md:p-8">
                    <Award className="h-6 w-6 text-primary" />
                    <AlertTitle className="text-xl font-semibold mb-2">
                        Your first cleaning awaits!
                    </AlertTitle>
                    <AlertDescription className="text-base text-muted-foreground mb-6">
                        Experience hassle-free, professional cleaning at your
                        doorstep. Book now and see the difference.
                    </AlertDescription>
                    <Button
                        size="lg"
                        className="gap-2"
                        onClick={() => navigate("/dashboard/booking_service")}
                    >
                        <Sparkles className="w-4 h-4" />
                        Schedule Your First Cleaning
                    </Button>
                </Alert>
            )}
            <MemberFooter
                user={user}
                totalBookings={clientStats?.data.total_bookings || 0}
            />
        </div>
    );
}
