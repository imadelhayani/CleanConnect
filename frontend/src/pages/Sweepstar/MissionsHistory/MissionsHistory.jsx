import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Trophy, Sparkles, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useMissionsHistory } from "@/Hooks/useBookings";
import MissionHistoryCard from "./components/MissionHistoryCard";
import EmptyHistoryState from "./components/EmptyHistoryState";

export default function MissionsHistory() {
    const navigate = useNavigate();
    const { data: jobs = [], isLoading } = useMissionsHistory();

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="text-center space-y-5">
                    <Loader2 className="h-14 w-14 animate-spin text-primary mx-auto" />
                    <div>
                        <p className="text-lg font-semibold text-foreground">
                            Loading history...
                        </p>
                        <p className="text-sm text-muted-foreground mt-1.5">
                            Fetching your past missions
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const pastJobs = jobs.filter(
        (job) => job.status === "completed" || job.status === "cancelled",
    );
    const completedCount = jobs.filter(
        (job) => job.status === "completed",
    ).length;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-4 md:p-6 max-w-7xl mx-auto">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-primary/8 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent p-8 md:p-12">
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/15 rounded-full blur-3xl dark:bg-primary/10" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl dark:bg-primary/5" />
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/80 border mb-6">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Archive</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Missions History
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        {pastJobs.length === 0
                            ? "No past missions yet"
                            : `${pastJobs.length} archived • ${completedCount} successful`}
                    </p>
                </div>
            </div>

            {/* Completed Count Badge */}
            {completedCount > 0 && (
                <div className="flex justify-end">
                    <Badge className="px-5 py-2.5 text-base font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow-md">
                        <Trophy className="w-4 h-4 mr-2" />
                        {completedCount} Completed
                    </Badge>
                </div>
            )}

            {/* Motivational Alert */}
            {completedCount > 0 && (
                <Alert className="border-green-200 bg-green-50/70 dark:bg-green-950/30 dark:border-green-800/40 rounded-xl">
                    <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <AlertTitle className="text-green-900 dark:text-green-300 font-semibold">
                        Great job! 🎉
                    </AlertTitle>
                    <AlertDescription className="text-green-800 dark:text-green-300 mt-1.5">
                        You've successfully completed {completedCount} mission
                        {completedCount !== 1 ? "s" : ""}.
                    </AlertDescription>
                </Alert>
            )}

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastJobs.length === 0 ? (
                    <div className="col-span-full">
                        <EmptyHistoryState
                            onFindJobs={() =>
                                navigate("/dashboard/available_missions")
                            }
                        />
                    </div>
                ) : (
                    pastJobs.map((job) => (
                        <MissionHistoryCard key={job.id} job={job} />
                    ))
                )}
            </div>
        </div>
    );
}
