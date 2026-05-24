import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    History,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Loader2,
} from "lucide-react";

import { useMyBookings } from "@/Hooks/useBookings";

import BookingHistoryStatsCards from "./Components/BookingHistoryStatsCards";
import BookingHistoryFilters from "./Components/BookingHistoryFilters";
import BookingCard from "./Components/BookingCard";

import ReviewModal from "../Review/ReviewModal";
import EditBookingModal from "./Components/EditBookingModal";
import CancelBookingModal from "./Components/CancelBookingModal";
import BookingDetailModal from "./Components/BookingDetailModal";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BookingHistory() {
    const navigate = useNavigate();
    const location = useLocation();
    const { data: bookings = [], isLoading } = useMyBookings();

    const [statusFilter, setStatusFilter] = useState("all");
    const [statusMsg, setStatusMsg] = useState({ type: "", msg: "" });
    const [editingBooking, setEditingBooking] = useState(null);
    const [reviewingBooking, setReviewingBooking] = useState(null);
    const [cancellingBooking, setCancellingBooking] = useState(null);
    const [viewingBooking, setViewingBooking] = useState(null);

    useEffect(() => {
        if (location.state?.message) {
            setStatusMsg({ type: "success", msg: location.state.message });
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleSuccess = (msg) => {
        setStatusMsg({ type: "success", msg });
        setEditingBooking(null);
        setReviewingBooking(null);
        setCancellingBooking(null);
    };

    const filteredBookings = (bookings || []).filter((booking) => {
        if (statusFilter === "all") return true;
        return booking.status?.toLowerCase() === statusFilter.toLowerCase();
    });

    const totalCount = bookings.length;
    const filteredCount = filteredBookings.length;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-4 md:p-6 max-w-7xl mx-auto">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-primary/8 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent p-8 md:p-12">
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/15 rounded-full blur-3xl dark:bg-primary/10" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl dark:bg-primary/5" />
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/80 border mb-6">
                        <History className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">
                            Your History
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Booking History
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        Track all your past and upcoming service requests.
                    </p>
                </div>
            </div>

            {/* Success Alert */}
            {statusMsg.msg && (
                <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800 rounded-xl">
                    <CheckCircle2 className="w-4 h-4" />
                    <AlertDescription>{statusMsg.msg}</AlertDescription>
                </Alert>
            )}

            {/* Stats Cards */}
            <BookingHistoryStatsCards bookings={bookings} />

            {/* Filters */}
            <BookingHistoryFilters
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                totalCount={totalCount}
                filteredCount={filteredCount}
            />

            {/* Content */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">
                        Loading your bookings...
                    </p>
                </div>
            ) : filteredBookings.length === 0 ? (
                <Card className="border-dashed py-16">
                    <CardContent className="flex flex-col items-center text-center">
                        <div className="p-4 rounded-full bg-muted mb-4">
                            <Calendar className="h-10 w-10 text-muted-foreground/40" />
                        </div>
                        <h3 className="font-semibold text-xl">
                            No bookings found
                        </h3>
                        <p className="text-muted-foreground max-w-xs mt-2">
                            We couldn't find any{" "}
                            {statusFilter !== "all" ? statusFilter : ""}{" "}
                            bookings.
                        </p>
                        <Button
                            onClick={() =>
                                navigate("/dashboard/booking_service")
                            }
                            className="mt-6"
                        >
                            Book a Service Now
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBookings.map((booking) => (
                        <BookingCard
                            key={booking.id}
                            booking={booking}
                            onEdit={setEditingBooking}
                            onCancel={setCancellingBooking}
                            onReviewAction={setReviewingBooking}
                            onViewDetails={() => setViewingBooking(booking)}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            <BookingDetailModal
                open={!!viewingBooking}
                booking={viewingBooking}
                onClose={() => setViewingBooking(null)}
            />
            {editingBooking && (
                <EditBookingModal
                    isOpen={!!editingBooking}
                    booking={editingBooking}
                    onClose={() => setEditingBooking(null)}
                    onSuccess={handleSuccess}
                />
            )}
            {cancellingBooking && (
                <CancelBookingModal
                    isOpen={!!cancellingBooking}
                    booking={cancellingBooking}
                    onClose={() => setCancellingBooking(null)}
                    onSuccess={handleSuccess}
                />
            )}
            {reviewingBooking && (
                <ReviewModal
                    isOpen={!!reviewingBooking}
                    booking={reviewingBooking}
                    onClose={() => setReviewingBooking(null)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}
