import React from "react";
import { Users, CheckCircle, Ban, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function UsersStatCards({ stats }) {
    const statItems = [
        {
            label: "Total Users",
            value: stats.total,
            icon: Users,
            color: "bg-primary/10 text-primary",
        },
        {
            label: "Active",
            value: stats.active,
            icon: CheckCircle,
            color: "bg-emerald-100/60 text-emerald-600",
        },
        {
            label: "Suspended",
            value: stats.suspended,
            icon: Ban,
            color: "bg-red-100/60 text-red-600",
        },
        {
            label: "Deleted",
            value: stats.deleted,
            icon: Trash2,
            color: "bg-gray-100/60 text-gray-600",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {statItems.map((stat, i) => {
                const Icon = stat.icon;
                return (
                    <Card
                        key={i}
                        className="rounded-xl border-border/60 bg-background/50 backdrop-blur-sm hover:shadow-lg transition-all"
                    >
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {stat.label}
                                    </p>
                                    <p className="text-3xl font-bold mt-2">
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
