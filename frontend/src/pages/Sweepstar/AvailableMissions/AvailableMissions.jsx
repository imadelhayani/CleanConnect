import React, { useState } from "react";
import { Briefcase, Loader2 } from "lucide-react";
import { useAvailableMissions, useAcceptMission } from "@/Hooks/useBookings";
import PaginationComponent from "@/components/ui/PaginationComponent";
import AvailableMissionCard from "./components/AvailableMissionCard";
import EmptyMissionsState from "./components/EmptyMissionsState";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { ContentLoader } from "@/components/ui/PageLoader";

export default function AvailableMissions() {
    const [page, setPage] = useState(1);
    const {
        data: paginatedData,
        isLoading,
        error,
    } = useAvailableMissions(page);
    const jobs = paginatedData?.data ?? [];
    const meta = paginatedData
        ? {
              current_page: paginatedData.current_page,
              last_page: paginatedData.last_page,
              per_page: paginatedData.per_page,
              total: paginatedData.total,
          }
        : null;
    const { mutateAsync: acceptMission } = useAcceptMission();
    const [processingId, setProcessingId] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        jobId: null,
    });

    if (isLoading) return <ContentLoader />;
    if (error)
        return (
            <div className="flex h-[60vh] items-center justify-center text-red-500">
                Failed to load missions. Please try again.
            </div>
        );

    const handleAcceptClick = (jobId) => setConfirmModal({ open: true, jobId });
    const handleConfirmAccept = async () => {
        const jobId = confirmModal.jobId;
        if (!jobId) return;
        setProcessingId(jobId);
        try {
            await acceptMission(jobId);
            setConfirmModal({ open: false, jobId: null });
        } catch (error) {
            console.error(error);
            setConfirmModal({ open: false, jobId: null });
        } finally {
            setProcessingId(null);
        }
    };
    const totalCount = meta?.total ?? jobs.length;

    return (
        <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-primary/8 to-transparent p-8 md:p-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/80 border mb-6">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Missions Board</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                    Available Missions
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                    {totalCount === 0
                        ? "No missions right now"
                        : `${totalCount} mission${totalCount !== 1 ? "s" : ""} available`}
                </p>
            </div>
            {jobs.length === 0 ? (
                <EmptyMissionsState />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <AvailableMissionCard
                                key={job.id}
                                job={job}
                                onAccept={handleAcceptClick}
                                isProcessing={processingId === job.id}
                            />
                        ))}
                    </div>
                    {meta && meta.last_page > 1 && (
                        <PaginationComponent
                            meta={meta}
                            onPageChange={setPage}
                        />
                    )}
                </>
            )}
            <ConfirmationModal
                open={confirmModal.open}
                onClose={() =>
                    setConfirmModal({ ...confirmModal, open: false })
                }
                onConfirm={handleConfirmAccept}
                title="Accept this Mission?"
                description="This will assign the mission to you. Accept only if you're ready."
                variant="default"
                confirmText="Yes, Accept Mission"
                isLoading={processingId === confirmModal.jobId}
            />
        </div>
    );
}
