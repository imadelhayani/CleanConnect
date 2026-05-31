// frontend/src/pages/Sweepstar/AvailableMissions/components/AvailableMissionCard.jsx
import { useState } from "react";
import { format } from "date-fns";
import {
    MapPin,
    Clock,
    Briefcase,
    Loader2,
    Zap,
    FileText,
    DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MissionDetailModal from "./MissionDetailModal";

// Format currency helper function
const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);

export default function AvailableMissionCard({
    job,
    onAccept,
    isProcessing,
    onViewDetails,
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Local state to prevent double‑click while the accept request is pending
    const [isAccepting, setIsAccepting] = useState(false);

    const scheduledDate = new Date(job.scheduled_at);

    const handleViewDetails = () => {
        setIsModalOpen(true);
        if (onViewDetails) onViewDetails(job.id);
    };

    // Wrapped accept handler with client‑side debouncing
    const handleAccept = async () => {
        if (isAccepting) return; // prevent duplicate clicks
        setIsAccepting(true);
        try {
            await onAccept(job.id);
        } finally {
            setIsAccepting(false);
        }
    };

    // Format options and extras (from the updated structure)
    const selectedOptions = job.booking_services[0]?.selected_options?.map(
        (option) => option.option?.name,
    );
    const selectedExtras = job.booking_services[0]?.selected_extras?.map(
        (extra) => extra.extra?.name,
    );

    return (
        <>
            <Card className="group relative overflow-hidden transition-all hover:shadow-xl border-primary/20 hover:border-primary/50 bg-card">
                {/* Top Gradient - Blue for Available */}
                <div className="h-1.5 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300" />

                <div className="absolute top-4 right-4">
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shadow-sm border-0">
                        Available
                    </Badge>
                </div>

                <CardHeader className="pb-4">
                    <div className="flex items-start gap-3">
                        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400">
                            <img
                                className="w-15 h-15"
                                src={`http://localhost:8000${
                                    job.booking_services[0]?.service
                                        ?.service_icon
                                }`}
                                alt={job.booking_services[0]?.service?.name}
                            />
                        </div>
                        <div>
                            <Badge variant="outline" className="mb-1.5 text-xs">
                                {job.booking_services[0]?.service?.name ||
                                    "Standard Clean"}
                            </Badge>
                            <CardTitle className="text-lg md:text-xl line-clamp-1">
                                {job.address?.city || "Unknown Location"}
                            </CardTitle>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {job.address?.street_address ||
                                    "Address hidden"}
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-5 pb-5">
                    {/* Date & Time Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border text-center">
                            <p className="text-xs font-bold text-slate-500 uppercase">
                                {format(scheduledDate, "MMM")}
                            </p>
                            <p className="text-xl font-bold text-foreground">
                                {format(scheduledDate, "d")}
                            </p>
                        </div>
                        <div className="col-span-2 space-y-2">
                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border flex items-center justify-between">
                                <span className="text-xs uppercase text-muted-foreground font-bold">
                                    {format(scheduledDate, "EEEE")}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {format(scheduledDate, "yyyy")}
                                </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium text-sm">
                                    {format(scheduledDate, "h:mm a")}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* PRICE SECTION */}
                    <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                    <DollarSign className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-semibold uppercase tracking-wide">
                                    Your Earning
                                </span>
                            </div>
                            <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                                {formatCurrency(job.total_price)}
                            </span>
                        </div>
                    </div>

                    {/* Options and Extras */}
                    {selectedOptions && selectedOptions.length > 0 && (
                        <div className="space-y-2">
                            <span className="text-sm font-semibold">
                                Options
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {selectedOptions.map((option, idx) => (
                                    <Badge
                                        key={idx}
                                        className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300"
                                    >
                                        {option}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                    {selectedExtras && selectedExtras.length > 0 && (
                        <div className="space-y-2">
                            <span className="text-sm font-semibold">
                                Extras
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {selectedExtras.map((extra, idx) => (
                                    <Badge
                                        key={idx}
                                        className="bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300"
                                    >
                                        {extra}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            onClick={handleAccept}
                            disabled={isProcessing || isAccepting}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all"
                        >
                            {isProcessing || isAccepting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Securing...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4 mr-2 fill-current" />
                                    Accept Mission
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleViewDetails}
                            className="px-3"
                        >
                            <FileText className="w-4 h-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <MissionDetailModal
                booking={job}
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
