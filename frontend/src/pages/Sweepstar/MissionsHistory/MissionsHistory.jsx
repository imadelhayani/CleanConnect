import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Trophy } from "lucide-react";
import { useMissionsHistory } from "@/Hooks/useBookings";
import PaginationComponent from "@/components/ui/PaginationComponent";
import MissionHistoryCard from "./components/MissionHistoryCard";
import EmptyHistoryState from "./components/EmptyHistoryState";
import { ContentLoader } from "@/components/ui/PageLoader";

export default function MissionsHistory() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const { data: paginatedData, isLoading } = useMissionsHistory(page, true);
    const jobs = paginatedData?.data ?? [];
    const meta = paginatedData
        ? {
              current_page: paginatedData.current_page,
              last_page: paginatedData.last_page,
              per_page: paginatedData.per_page,
              total: paginatedData.total,
          }
        : null;
    const archivedCount = paginatedData?.archived_count ?? 0;
    const completedCount = paginatedData?.completed_count ?? 0;

    if (isLoading) return <ContentLoader />;

    return (
        <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-primary/8 to-transparent p-8 md:p-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/80 border mb-6">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Archive</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                    Missions History
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                    {archivedCount === 0
                        ? "No past missions yet"
                        : `${archivedCount} archived • ${completedCount} successful`}
                </p>
            </div>
            {jobs.length === 0 ? (
                <EmptyHistoryState
                    onFindJobs={() => navigate("/dashboard/available_missions")}
                />
            ) : (
                <>
                    <div className="flex justify-end">
                        <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full flex items-center gap-2">
                            <Trophy className="w-4 h-4" /> {completedCount}{" "}
                            Completed
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <MissionHistoryCard key={job.id} job={job} />
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
        </div>
    );
}
