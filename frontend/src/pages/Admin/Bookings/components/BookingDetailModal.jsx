import React, { useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    AlertTriangle,
    MapPin,
    Clock,
    Layers3,
    Plus,
    Sparkles,
    Receipt,
    User2,
    ShieldCheck,
    Timer,
} from "lucide-react";
import {
    formatDate,
    formatCurrency,
    formatDuration,
    safeArr,
    STATUS_STYLES,
} from "@/utils/bookingHelpers";

// --- Sub-Components ---
const InfoCard = ({
    title,
    icon: Icon,
    badgeLabel,
    badgeIcon: BadgeIcon,
    children,
}) => (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 dark:from-slate-900/60 to-slate-100/40 dark:to-slate-900/20 p-4 hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {title}
            </p>
            <Badge variant="secondary" className="border-0">
                <span className="inline-flex items-center gap-1.5">
                    <BadgeIcon className="w-3.5 h-3.5" />
                    {badgeLabel}
                </span>
            </Badge>
        </div>
        {children}
    </div>
);

const OptionSection = ({ title, icon: Icon, items, emptyText }) => (
    <div className="rounded-2xl border bg-background/60 p-3">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
                <Icon className="w-4 h-4 text-primary" />
                {title}
            </div>
            <Badge variant="secondary" className="border-0">
                {items.length}
            </Badge>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
            {items.length > 0 ? (
                items.slice(0, 6).map((name) => (
                    <span
                        key={name}
                        className="inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1 text-xs text-foreground/80 shadow-sm"
                    >
                        <Icon className="w-3.5 h-3.5 text-primary" />
                        <span className="max-w-[220px] truncate">{name}</span>
                    </span>
                ))
            ) : (
                <p className="text-sm text-muted-foreground">{emptyText}</p>
            )}
            {items.length > 6 && (
                <span className="text-xs text-muted-foreground">
                    +{items.length - 6} more
                </span>
            )}
        </div>
    </div>
);

export default function BookingDetailModal({ booking, open, onClose }) {
    if (!booking) return null;

    const statusKey = booking.status?.toLowerCase() || "pending";
    const bookingService = booking?.booking_services?.[0] || null;

    const serviceNames = useMemo(
        () =>
            safeArr(booking.services)
                .map((s) => s?.name)
                .filter(Boolean)
                .join(", ") ||
            bookingService?.service?.name ||
            "Cleaning Service",
        [booking, bookingService],
    );

    const selectedOptions = useMemo(() => {
        const raw =
            bookingService?.selected_options ||
            bookingService?.options ||
            bookingService?.booking_service_options ||
            [];
        return safeArr(raw)
            .map((o) => o?.service_option?.name || o?.option?.name || o?.name)
            .filter(Boolean);
    }, [bookingService]);

    const selectedExtras = useMemo(() => {
        const raw =
            bookingService?.selected_extras ||
            bookingService?.extras ||
            bookingService?.booking_service_extras ||
            [];
        return safeArr(raw)
            .map((e) => e?.service_extra?.name || e?.extra?.name || e?.name)
            .filter(Boolean);
    }, [bookingService]);

    const durationLabel = formatDuration(
        booking?.duration_minutes ??
            booking?.estimated_duration_minutes ??
            bookingService?.duration_minutes ??
            0,
    );

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[720px] max-h-[85vh] p-0 gap-0 overflow-hidden rounded-3xl border-slate-200 dark:border-slate-800 bg-background/95 backdrop-blur-sm flex flex-col">
                <DialogHeader className="flex-shrink-0 p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 dark:from-slate-900 to-slate-100/50 dark:to-slate-900/50">
                    <DialogTitle className="text-2xl font-black text-foreground">
                        Booking Details
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-1">
                        Reference #{booking.id}
                    </DialogDescription>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Badge
                            className={`border-0 shadow-sm capitalize ${STATUS_STYLES[statusKey] || STATUS_STYLES.pending}`}
                        >
                            {booking.status}
                        </Badge>
                        <Badge
                            variant="secondary"
                            className="border-0 shadow-sm"
                        >
                            <span className="inline-flex items-center gap-1.5">
                                <Receipt className="w-3.5 h-3.5" />
                                {formatCurrency(booking.total_price)}
                            </span>
                        </Badge>
                        {durationLabel !== "N/A" && (
                            <Badge
                                variant="secondary"
                                className="border-0 shadow-sm"
                            >
                                <span className="inline-flex items-center gap-1.5">
                                    <Timer className="w-3.5 h-3.5" />
                                    {durationLabel}
                                </span>
                            </Badge>
                        )}
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {statusKey === "cancelled" && (
                        <Alert className="border-red-200 bg-red-50/80 rounded-2xl">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800 text-sm font-medium">
                                Cancelled:{" "}
                                {booking.cancellation_reason ||
                                    "No reason provided"}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                        <InfoCard
                            title="Client"
                            badgeLabel="Customer"
                            badgeIcon={User2}
                        >
                            <div className="mt-3 flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black">
                                    {booking.user?.name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">
                                        {booking.user?.name || "N/A"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {booking.user?.email}
                                    </p>
                                </div>
                            </div>
                        </InfoCard>

                        <InfoCard
                            title="Sweepstar"
                            badgeLabel="Provider"
                            badgeIcon={ShieldCheck}
                        >
                            <div className="mt-3 flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-blue-100/60 flex items-center justify-center text-blue-700 font-black">
                                    {booking.sweepstar?.name?.charAt(0) || "?"}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">
                                        {booking.sweepstar?.name ||
                                            "Not Assigned"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {booking.sweepstar?.email ||
                                            "Waiting..."}
                                    </p>
                                </div>
                            </div>
                        </InfoCard>
                    </div>

                    <Separator />

                    <div className="rounded-2xl border p-4 bg-muted/10">
                        <div className="flex justify-between mb-4">
                            <div>
                                <p className="text-xs font-bold uppercase text-muted-foreground">
                                    Service
                                </p>
                                <p className="mt-2 text-lg font-bold">
                                    {serviceNames}
                                </p>
                            </div>
                            <Badge className="bg-purple-100 text-purple-700">
                                Requested
                            </Badge>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            <OptionSection
                                title="Options"
                                icon={Layers3}
                                items={selectedOptions}
                                emptyText="No options selected"
                            />
                            <OptionSection
                                title="Extra Tasks"
                                icon={Plus}
                                items={selectedExtras}
                                emptyText="No extra tasks"
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-2xl bg-slate-50">
                            <p className="text-xs font-bold text-muted-foreground uppercase">
                                Location
                            </p>
                            <p className="mt-2 text-sm flex gap-2 font-medium">
                                <MapPin className="w-4 h-4 text-primary" />{" "}
                                {booking.address?.street_address},{" "}
                                {booking.address?.city}
                            </p>
                        </div>
                        <div className="p-4 border rounded-2xl bg-slate-50">
                            <p className="text-xs font-bold text-muted-foreground uppercase">
                                Date & Time
                            </p>
                            <p className="mt-2 text-sm flex gap-2 font-medium">
                                <Clock className="w-4 h-4 text-primary" />{" "}
                                {formatDate(booking.scheduled_at)}
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
