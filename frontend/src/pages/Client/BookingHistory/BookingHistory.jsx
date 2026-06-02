import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { History, CheckCircle2, Loader2 } from "lucide-react";
import { useMyBookings } from "@/Hooks/useBookings";
import PaginationComponent from "@/components/ui/PaginationComponent";
import BookingHistoryStatsCards from "./Components/BookingHistoryStatsCards";
import BookingHistoryFilters from "./Components/BookingHistoryFilters";
import BookingCard from "./Components/BookingCard";
import ReviewModal from "../Review/ReviewModal";
import EditBookingModal from "./Components/EditBookingModal";
import CancelBookingModal from "./Components/CancelBookingModal";
import BookingDetailModal from "./Components/BookingDetailModal";

export default function BookingHistory() {
    const navigate = useNavigate();
    const location = useLocation();
    const [page, setPage] = useState(1);
    const { data: paginatedData, isLoading } = useMyBookings(page);

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

    const filteredBookings = bookings.filter((b) =>
        statusFilter === "all"
            ? true
            : b.status?.toLowerCase() === statusFilter.toLowerCase(),
    );

    if (isLoading)
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );

    return (
        <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-primary/8 to-transparent p-8 md:p-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/80 border mb-6">
                    <History className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Your History</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                    Booking History
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                    Track all your past and upcoming service requests.
                </p>
            </div>

            {statusMsg.msg && (
                <div className="bg-green-50 border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> {statusMsg.msg}
                </div>
            )}
            <BookingHistoryStatsCards stats={stats} />
            <BookingHistoryFilters
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                totalCount={meta?.total || 0}
                filteredCount={filteredBookings.length}
            />
            {filteredBookings.length === 0 ? (
                <div className="text-center py-16">No bookings found</div>
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
            {meta && meta.last_page > 1 && (
                <PaginationComponent meta={meta} onPageChange={setPage} />
            )}

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
