import React, { useState } from "react";
import { Briefcase, Zap, TrendingUp, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAvailableMissions, useAcceptMission } from "@/Hooks/useBookings";
import EmptyMissionsState from "./components/EmptyMissionsState";
import MissionCard from "./components/AvailableMissionCard";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import MissionDetailModal from "./components/MissionDetailModal";

export default function AvailableMissions() {
    const { data: jobs = [], isLoading } = useAvailableMissions();
    const { mutateAsync: acceptMission } = useAcceptMission();

    const [processingId, setProcessingId] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        jobId: null,
    });

    const handleAcceptClick = (jobId) => {
        setConfirmModal({ open: true, jobId });
    };

    const handleConfirmAccept = async () => {
        const jobId = confirmModal.jobId;
        if (!jobId) return;
        setProcessingId(jobId);
        try {
            await acceptMission(jobId);
            setConfirmModal({ open: false, jobId: null });
        } catch (error) {
            console.error("Acceptance failed", error);
            setConfirmModal({ open: false, jobId: null });
        } finally {
            setProcessingId(null);
        }
    };

    const handleViewDetails = (jobId) => {
        const job = jobs.find((j) => j.id === jobId);
        if (job) setSelectedJob(job);
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="text-center space-y-5">
                    <div className="h-14 w-14 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
                    <div>
                        <p className="text-lg font-semibold text-foreground">
                            Searching for Missions...
                        </p>
                        <p className="text-sm text-muted-foreground mt-1.5">
                            Finding available jobs near you
                        </p>
                    </div>
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
                        <Briefcase className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">
                            Missions Board
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Available Missions
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        {jobs.length === 0
                            ? "No missions right now – check back later"
                            : `${jobs.length} mission${jobs.length !== 1 ? "s" : ""} ready for you to grab`}
                    </p>
                </div>
            </div>

            {/* Motivational Alert */}
            {jobs.length > 0 && (
                <Alert className="border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-xl">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <AlertTitle className="text-foreground font-semibold">
                        Great Earning Missions Available! 🚀
                    </AlertTitle>
                    <AlertDescription className="text-muted-foreground mt-1">
                        Accept quickly to boost your rating and earn more.
                    </AlertDescription>
                </Alert>
            )}

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.length === 0 ? (
                    <div className="col-span-full">
                        <EmptyMissionsState />
                    </div>
                ) : (
                    jobs.map((job) => (
                        <MissionCard
                            key={job.id}
                            job={job}
                            onAccept={handleAcceptClick}
                            onViewDetails={handleViewDetails}
                            isProcessing={processingId === job.id}
                        />
                    ))
                )}
            </div>

            <ConfirmationModal
                open={confirmModal.open}
                onClose={() =>
                    setConfirmModal({ ...confirmModal, open: false })
                }
                onConfirm={handleConfirmAccept}
                title="Accept this Mission?"
                description="This will assign the mission to you. Make sure it fits your availability — accept only if you're ready to complete it."
                variant="default"
                confirmText="Yes, Accept Mission"
                isLoading={processingId === confirmModal.jobId}
            />

            <MissionDetailModal
                open={!!selectedJob}
                booking={selectedJob}
                onClose={() => setSelectedJob(null)}
            />
        </div>
    );
}
