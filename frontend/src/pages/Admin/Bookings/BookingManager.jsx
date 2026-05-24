import React, { useState } from "react";
import { Loader2, BarChart3 } from "lucide-react";
import { useAllBookings, useEditBooking } from "@/Hooks/useBookings";
import BookingStats from "./components/BookingStats";
import BookingFilter from "./components/BookingFilter";
import BookingsTable from "./components/BookingsTable";
import BookingDetailModal from "./components/BookingDetailModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

export default function BookingManager() {
    const { data: bookings = [], isLoading } = useAllBookings();
    const editBookingMutation = useEditBooking();
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [confirmState, setConfirmState] = useState({
        open: false,
        type: null,
        id: null,
    });

    const handleApproveClick = (id) =>
        setConfirmState({ open: true, type: "APPROVE", id });
    const handleRejectClick = (id) =>
        setConfirmState({ open: true, type: "REJECT", id });

    const handleFinalConfirmation = async () => {
        const { type, id } = confirmState;
        try {
            if (type === "APPROVE")
                await editBookingMutation.mutateAsync({
                    id,
                    data: { status: "confirmed" },
                });
            else if (type === "REJECT")
                await editBookingMutation.mutateAsync({
                    id,
                    data: {
                        status: "cancelled",
                        cancellation_reason: "Rejected by Admin",
                    },
                });
            setConfirmState({ ...confirmState, open: false });
        } catch (error) {
            console.error("Action failed", error);
        }
    };

    const getModalContent = () => {
        if (confirmState.type === "APPROVE")
            return {
                title: "Confirm Booking?",
                description: "Mark this booking as confirmed?",
                variant: "default",
                confirmText: "Confirm Booking",
            };
        return {
            title: "Reject Booking?",
            description: "Are you sure? This cannot be undone.",
            variant: "destructive",
            confirmText: "Reject Booking",
        };
    };

    const modalContent = getModalContent();
    const filteredBookings = bookings.filter((b) =>
        filterStatus === "all" ? true : b.status === filterStatus,
    );

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground text-lg">
                        Loading bookings...
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
                        <BarChart3 className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">
                            Booking Oversight
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Booking Management
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        Monitor and manage all client bookings, sweepstar
                        assignments, and service delivery.
                    </p>
                </div>
            </div>

            <BookingStats bookings={bookings} />
            <BookingFilter
                filterStatus={filterStatus}
                onFilterChange={setFilterStatus}
                stats={{
                    total: bookings.length,
                    pending: bookings.filter((b) => b.status === "pending")
                        .length,
                    confirmed: bookings.filter((b) => b.status === "confirmed")
                        .length,
                    completed: bookings.filter((b) => b.status === "completed")
                        .length,
                    cancelled: bookings.filter((b) => b.status === "cancelled")
                        .length,
                }}
            />
            <BookingsTable
                bookings={filteredBookings}
                onApprove={handleApproveClick}
                onReject={handleRejectClick}
                onViewDetails={setSelectedBooking}
                isMutating={editBookingMutation.isPending}
            />
            <BookingDetailModal
                booking={selectedBooking}
                open={!!selectedBooking}
                onClose={() => setSelectedBooking(null)}
            />
            <ConfirmationModal
                open={confirmState.open}
                onClose={() =>
                    setConfirmState({ ...confirmState, open: false })
                }
                onConfirm={handleFinalConfirmation}
                title={modalContent.title}
                description={modalContent.description}
                variant={modalContent.variant}
                confirmText={modalContent.confirmText}
                isLoading={editBookingMutation.isPending}
            />
        </div>
    );
}
