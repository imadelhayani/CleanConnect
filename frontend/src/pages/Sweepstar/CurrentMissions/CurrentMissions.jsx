// frontend/src/pages/Sweepstar/CurrentMissions/CurrentMissions.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Zap, Sparkles, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCompleteMission, useCurrentMissions } from "@/Hooks/useBookings";
import PaginationComponent from "@/components/ui/PaginationComponent";
import EmptyHistoryState from "../MissionsHistory/components/EmptyHistoryState";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import CurrentMissionCard from "./components/CurrentMissionCard";

export default function CurrentMissions() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const { data: paginatedData, isLoading, error } = useCurrentMissions(page);
    const { mutateAsync: completeMission, isPending: isCompletingMission } =
        useCompleteMission();

    // Extract active jobs from paginated response
    const jobs = paginatedData?.data ?? [];
    const meta = paginatedData
        ? {
              current_page: paginatedData.current_page,
              last_page: paginatedData.last_page,
              per_page: paginatedData.per_page,
              total: paginatedData.total,
          }
        : null;

    // Global statistics from backend
    const activeCount = paginatedData?.total_all ?? 0;
    const completedCount = paginatedData?.completed_count ?? 0;

    const [completingId, setCompletingId] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ open: false, id: null });

    const handleCompleteClick = (id) => setConfirmModal({ open: true, id });
    const handleConfirmComplete = async () => {
        const id = confirmModal.id;
        if (!id) return;
        setCompletingId(id);
        try {
            await completeMission(id);
            setConfirmModal({ open: false, id: null });
        } catch (error) {
            console.error("Failed to complete mission", error);
        } finally {
            setCompletingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="text-center space-y-5">
                    <Loader2 className="h-14 w-14 animate-spin text-primary mx-auto" />
                    <div>
                        <p className="text-lg font-semibold text-foreground">
                            Loading missions...
                        </p>
                        <p className="text-sm text-muted-foreground mt-1.5">
                            Syncing your current schedule
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[60vh] items-center justify-center text-red-500">
                Failed to load missions. Please try again.
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
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">
                            Active Schedule
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Current Missions
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        {activeCount === 0
                            ? "No active missions right now"
                            : `${activeCount} active mission${activeCount !== 1 ? "s" : ""} • ${completedCount} completed total`}
                    </p>
                </div>
            </div>

            {/* Motivational Alert */}
            {activeCount > 0 && (
                <Alert className="border-blue-200 bg-blue-50/70 dark:bg-blue-950/30 dark:border-blue-800/40 rounded-xl">
                    <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <AlertTitle className="text-blue-900 dark:text-blue-300 font-semibold">
                        You're in demand! 🚀
                    </AlertTitle>
                    <AlertDescription className="text-blue-800 dark:text-blue-300 mt-1.5">
                        You have {activeCount} active mission
                        {activeCount !== 1 ? "s" : ""} to complete.
                    </AlertDescription>
                </Alert>
            )}

            {/* Content */}
            {jobs.length === 0 ? (
                <EmptyHistoryState
                    onFindJobs={() => navigate("/dashboard/available_missions")}
                />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <CurrentMissionCard
                                key={job.id}
                                job={job}
                                onComplete={handleCompleteClick}
                                isCompleting={
                                    completingId === job.id &&
                                    isCompletingMission
                                }
                            />
                        ))}
                    </div>
                    {/* Pagination based on active missions only */}
                    {meta && meta.last_page > 1 && (
                        <PaginationComponent
                            meta={meta}
                            onPageChange={setPage}
                        />
                    )}
                </>
            )}

            {/* Motivational Footer */}
            {activeCount > 0 && (
                <Alert className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 rounded-xl">
                    <Zap className="h-5 w-5 text-primary" />
                    <AlertTitle className="font-semibold">
                        Keep the momentum going! 💪
                    </AlertTitle>
                    <AlertDescription className="text-muted-foreground mt-2">
                        Finish your {activeCount} upcoming mission
                        {activeCount !== 1 ? "s" : ""} to improve your stats and
                        earnings.
                    </AlertDescription>
                </Alert>
            )}

            <ConfirmationModal
                open={confirmModal.open}
                onClose={() =>
                    setConfirmModal({ ...confirmModal, open: false })
                }
                onConfirm={handleConfirmComplete}
                title="Complete Mission?"
                description="Are you sure you want to mark this mission as completed? This will update your status and notify the client."
                variant="default"
                confirmText="Complete Mission"
                isLoading={isCompletingMission}
            />
        </div>
    );
}
