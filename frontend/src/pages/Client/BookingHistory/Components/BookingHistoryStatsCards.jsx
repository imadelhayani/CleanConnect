import React from "react";
import {
    Calendar,
    CheckCircle,
    CheckCircle2,
    Clock,
    XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function BookingHistoryStatsCards({ stats }) {
    const statItems = [
        {
            label: "Total Bookings",
            value: stats.total,
            icon: Calendar,
            color: "bg-primary/10 text-primary",
        },
        {
            label: "Pending",
            value: stats.pending,
            icon: Clock,
            color: "bg-yellow-100/60 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
        },
        {
            label: "Confirmed",
            value: stats.confirmed,
            icon: CheckCircle2,
            color: "bg-blue-100/60 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
        },
        {
            label: "Completed",
            value: stats.completed,
            icon: CheckCircle,
            color: "bg-emerald-100/60 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
        },
        {
            label: "Cancelled",
            value: stats.cancelled,
            icon: XCircle,
            color: "bg-red-100/60 text-red-600 dark:bg-red-900/20 dark:text-red-400",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
            {statItems.map((stat, i) => {
                const Icon = stat.icon;
                return (
                    <Card
                        key={i}
                        className="rounded-xl border-border/60 bg-background/50 backdrop-blur-sm hover:shadow-md transition-all"
                    >
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {stat.label}
                                    </p>
                                    <p className="text-3xl font-bold text-foreground mt-2">
                                        {stat.value}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
