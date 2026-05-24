import React, { useState } from "react";
import { UserCheck, Loader2, AlertCircle } from "lucide-react";
import {
    usePendingApplications,
    useApproveApplication,
    useRejectApplication,
} from "@/Hooks/useSweepstar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ApplicationsStatCards from "./components/ApplicationsStatCards";
import ApplicationSearch from "./components/ApplicationsSearch";
import ApplicationsTable from "./components/ApplicationsTable";
import ApplicationDetailModal from "./components/ApplicationDetailModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

export default function ApplicationManager() {
    const {
        data: applications = [],
        isLoading,
        isError,
    } = usePendingApplications();
    const approveMutation = useApproveApplication();
    const rejectMutation = useRejectApplication();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedApp, setSelectedApp] = useState(null);
    const [confirmState, setConfirmState] = useState({
        open: false,
        type: null,
        id: null,
        name: null,
    });

    const filteredApps = applications.filter((app) => {
        const term = searchTerm.toLowerCase();
        return (
            (app.user?.name || "").toLowerCase().includes(term) ||
            (app.user?.email || "").toLowerCase().includes(term)
        );
    });

    const handleApproveClick = (id, name) =>
        setConfirmState({ open: true, type: "APPROVE", id, name });
    const handleRejectClick = (id, name) =>
        setConfirmState({ open: true, type: "REJECT", id, name });
    const handleFinalConfirmation = async () => {
        const { type, id } = confirmState;
        try {
            if (type === "APPROVE") await approveMutation.mutateAsync(id);
            else if (type === "REJECT") await rejectMutation.mutateAsync(id);
            setConfirmState({ ...confirmState, open: false });
        } catch (error) {
            console.error("Action failed", error);
        }
    };

    const getModalContent = () => {
        if (confirmState.type === "APPROVE")
            return {
                title: "Approve Sweepstar?",
                description: `Are you sure you want to promote ${confirmState.name || "this applicant"} to a Sweepstar?`,
                variant: "default",
                confirmText: "Approve Application",
            };
        return {
            title: "Reject Application?",
            description: "Are you sure? This action cannot be undone.",
            variant: "destructive",
            confirmText: "Reject Application",
        };
    };
    const modalContent = getModalContent();
    const avgRate = applications.length
        ? (
              applications.reduce(
                  (sum, a) => sum + Number(a.hourly_rate || 0),
                  0,
              ) / applications.length
          ).toFixed(2)
        : "0.00";

    if (isLoading)
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    if (isError)
        return <Alert variant="destructive">Error loading applications</Alert>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-4 md:p-6 max-w-7xl mx-auto">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-primary/8 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent p-8 md:p-12">
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/15 rounded-full blur-3xl dark:bg-primary/10" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl dark:bg-primary/5" />
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/80 border mb-6">
                        <UserCheck className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">
                            Verification Queue
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Sweepstar Requests
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        Review and approve applications from users who want to
                        join our professional network.
                    </p>
                </div>
            </div>

            <ApplicationsStatCards
                applicationsCount={applications.length}
                filteredCount={filteredApps.length}
                avgRate={avgRate}
            />
            <ApplicationSearch
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />
            <ApplicationsTable
                applications={filteredApps}
                searchTerm={searchTerm}
                onApprove={handleApproveClick}
                onReject={handleRejectClick}
                isApproving={false}
                isRejecting={false}
                onViewDetails={setSelectedApp}
            />
            <ApplicationDetailModal
                application={selectedApp}
                open={!!selectedApp}
                onClose={() => setSelectedApp(null)}
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
                isLoading={
                    approveMutation.isPending || rejectMutation.isPending
                }
            />
        </div>
    );
}
