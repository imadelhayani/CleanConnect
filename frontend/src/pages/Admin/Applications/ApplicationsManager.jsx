import React, { useState } from "react";
import { UserCheck, Loader2 } from "lucide-react";
import {
    usePendingApplications,
    useApproveApplication,
    useRejectApplication,
} from "@/Hooks/useSweepstar";
import PaginationComponent from "@/components/ui/PaginationComponent";
import ApplicationsStatCards from "./components/ApplicationsStatCards";
import ApplicationSearch from "./components/ApplicationsSearch";
import ApplicationsTable from "./components/ApplicationsTable";
import ApplicationDetailModal from "./components/ApplicationDetailModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

export default function ApplicationManager() {
    const [page, setPage] = useState(1);
    const {
        data: paginatedData,
        isLoading,
        isError,
    } = usePendingApplications(page);

    const applications = paginatedData?.data ?? [];
    const stats = paginatedData?.stats ?? { total: 0 };
    const meta = paginatedData
        ? {
              current_page: paginatedData.current_page,
              last_page: paginatedData.last_page,
              per_page: paginatedData.per_page,
              total: paginatedData.total,
          }
        : null;

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
    if (isError) return <div>Error loading applications</div>;

    return (
        <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-primary/8 to-transparent p-8 md:p-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/80 border mb-6">
                    <UserCheck className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">
                        Verification Queue
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                    Sweepstar Requests
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                    Review and approve applications.
                </p>
            </div>
            <ApplicationsStatCards
                applicationsCount={stats.total}
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
            {meta && meta.last_page > 1 && (
                <PaginationComponent meta={meta} onPageChange={setPage} />
            )}
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
                title={
                    confirmState.type === "APPROVE"
                        ? "Approve Sweepstar?"
                        : "Reject Application?"
                }
                description={
                    confirmState.type === "APPROVE"
                        ? `Promote ${confirmState.name} to Sweepstar?`
                        : "Are you sure? This cannot be undone."
                }
                variant={
                    confirmState.type === "APPROVE" ? "default" : "destructive"
                }
                confirmText={
                    confirmState.type === "APPROVE"
                        ? "Approve Application"
                        : "Reject Application"
                }
                isLoading={
                    approveMutation.isPending || rejectMutation.isPending
                }
            />
        </div>
    );
}
