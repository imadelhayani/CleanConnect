import React, { useState } from "react";
import { Bell, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { NotificationHandlers } from "@/layout/NavBar/NotificationRoutes";
import { useNotifications } from "@/Hooks/useNotifications";
import PaginationComponent from "@/components/ui/PaginationComponent";

export default function NotificationsPage() {
    const [page, setPage] = useState(1);
    const { notifications, meta, markRead, markAllRead, isLoading } =
        useNotifications(page);

    const navigate = useNavigate();

    const handleNotifClick = (notif) => {
        markRead(notif.id);
        const handler = NotificationHandlers[notif.data.type];
        if (handler) handler(navigate, notif.data);
    };

    if (isLoading)
        return <div className="p-8 text-center">Loading notifications...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <Bell className="h-6 w-6" /> Notifications
                    </CardTitle>
                    {meta?.total > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAllRead()}
                        >
                            Mark all as read
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    {notifications.length === 0 ? (
                        <p className="text-center text-muted-foreground py-10">
                            No notifications found.
                        </p>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => handleNotifClick(notif)}
                                className={`p-4 rounded-lg border cursor-pointer transition-colors flex items-start gap-4 ${
                                    !notif.read_at
                                        ? "bg-primary/5 border-primary/20"
                                        : "bg-card"
                                } hover:bg-accent`}
                            >
                                <div className="mt-1">
                                    {!notif.read_at ? (
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                    ) : (
                                        <Check className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p
                                        className={`text-sm ${!notif.read_at ? "font-bold" : "text-foreground"}`}
                                    >
                                        {notif.data.message}
                                    </p>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date(
                                            notif.created_at,
                                        ).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                    {meta && meta.last_page > 1 && (
                        <PaginationComponent
                            meta={meta}
                            onPageChange={setPage}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
