import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    BarChart3,
    Clock,
    CheckCircle,
    TrendingUp,
    XCircle,
} from "lucide-react";

export default function BookingStats({ stats }) {
    const statItems = [
        {
            label: "Total Bookings",
            value: stats.total,
            icon: BarChart3,
            color: "from-primary/20 to-primary/10 text-primary border-primary/20",
        },
        {
            label: "Pending",
            value: stats.pending,
            icon: Clock,
            color: "from-amber-100/60 to-amber-50/60 dark:from-amber-900/20 dark:to-amber-900/10 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50",
        },
        {
            label: "Confirmed",
            value: stats.confirmed,
            icon: CheckCircle,
            color: "from-blue-100/60 to-blue-50/60 dark:from-blue-900/20 dark:to-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50",
        },
        {
            label: "Completed",
            value: stats.completed,
            icon: TrendingUp,
            color: "from-emerald-100/60 to-emerald-50/60 dark:from-emerald-900/20 dark:to-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50",
        },
        {
            label: "Cancelled",
            value: stats.cancelled,
            icon: XCircle,
            color: "from-red-100/60 to-red-50/60 dark:from-red-900/20 dark:to-red-900/10 text-red-600 dark:text-red-400 border-red-200/50 dark:border-red-800/50",
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {statItems.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                    <Card
                        key={idx}
                        className={`rounded-xl bg-gradient-to-br ${stat.color} border transition-all hover:shadow-lg hover:scale-105`}
                    >
                        <CardContent className="p-4 text-center space-y-3">
                            <div className="inline-flex p-2.5 rounded-lg bg-white/50 dark:bg-slate-800/50 shadow-sm">
                                <Icon className="w-5 h-5 opacity-70" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    {stat.label}
                                </p>
                                <p className="text-3xl font-bold text-foreground mt-1">
                                    {stat.value}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
