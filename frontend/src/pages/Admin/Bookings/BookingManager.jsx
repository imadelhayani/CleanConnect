import React, { useState } from "react";
import { Loader2, BarChart3 } from "lucide-react";
import { useAllBookings, useEditBooking } from "@/Hooks/useBookings";
import PaginationComponent from "@/components/ui/PaginationComponent";
import BookingStats from "./components/BookingStats";
import BookingFilter from "./components/BookingFilter";
import BookingsTable from "./components/BookingsTable";
import BookingDetailModal from "./components/BookingDetailModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { ContentLoader } from "@/components/ui/PageLoader";

export default function BookingManager() {
    const [page, setPage] = useState(1);
    const { data: paginatedData, isLoading } = useAllBookings(page);
    const bookings = paginatedData?.data ?? [];
    const stats = paginatedData?.stats ?? {
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
    };
    const meta = paginatedData
        ? {
              current_page: paginatedData.current_page,
              last_page: paginatedData.last_page,
              per_page: paginatedData.per_page,
              total: paginatedData.total,
          }
        : null;
    const editBookingMutation = useEditBooking();
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [confirmState, setConfirmState] = useState({
        open: false,
        type: null,
        id: null,
    });

    if (isLoading) return <ContentLoader />;

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

    const filteredBookings = bookings.filter((b) =>
        filterStatus === "all" ? true : b.status === filterStatus,
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-4 md:p-6 max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-primary/8 to-transparent p-8 md:p-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/80 border mb-6">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">
                        Booking Oversight
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                    Booking Management
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                    Monitor and manage all client bookings.
                </p>
            </div>
            <BookingStats stats={stats} />
            <BookingFilter
                filterStatus={filterStatus}
                onFilterChange={setFilterStatus}
                stats={{}}
            />
            <BookingsTable
                bookings={filteredBookings}
                onApprove={handleApproveClick}
                onReject={handleRejectClick}
                onViewDetails={setSelectedBooking}
                isMutating={false}
            />
            {meta && meta.last_page > 1 && (
                <PaginationComponent meta={meta} onPageChange={setPage} />
            )}
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
                title={
                    confirmState.type === "APPROVE"
                        ? "Confirm Booking?"
                        : "Reject Booking?"
                }
                description={
                    confirmState.type === "APPROVE"
                        ? "Mark this booking as confirmed?"
                        : "Are you sure? This cannot be undone."
                }
                variant={
                    confirmState.type === "APPROVE" ? "default" : "destructive"
                }
                confirmText={
                    confirmState.type === "APPROVE"
                        ? "Confirm Booking"
                        : "Reject Booking"
                }
                isLoading={editBookingMutation.isPending}
            />
        </div>
    );
}
