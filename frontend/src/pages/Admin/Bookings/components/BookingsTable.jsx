import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    CalendarDays,
    CheckCircle,
    Clock,
    Eye,
    MapPin,
    XCircle,
} from "lucide-react";
import { getAvatarUrl, getInitials } from "@/utils/avatarHelper";
import { formatDate } from "@/utils/bookingHelpers";

const STATUS_CONFIG = {
    confirmed: {
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icon: CheckCircle,
    },
    completed: {
        color: "bg-emerald-100 text-emerald-700 border-emerald-200",
        icon: CheckCircle,
    },
    cancelled: {
        color: "bg-red-100 text-red-700 border-red-200",
        icon: XCircle,
    },
    pending: {
        color: "bg-amber-100 text-amber-700 border-amber-200",
        icon: Clock,
    },
};

export default function BookingsTable({
    bookings,
    onApprove,
    onReject,
    onViewDetails,
    isMutating,
}) {
    return (
        <Card className="rounded-xl border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-900">
                        {[
                            "Ref ID",
                            "Client",
                            "Sweepstar",
                            "Location",
                            "Schedule",
                            "Status",
                            "Actions",
                        ].map((head) => (
                            <TableHead
                                key={head}
                                className="px-4 py-4 text-xs font-bold uppercase"
                            >
                                {head}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bookings.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={7}
                                className="py-16 text-center"
                            >
                                <div className="flex flex-col items-center gap-2 opacity-50">
                                    <CalendarDays className="w-12 h-12" />
                                    <p className="font-semibold">
                                        No bookings found
                                    </p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        bookings.map((booking) => {
                            const status =
                                STATUS_CONFIG[booking.status] ||
                                STATUS_CONFIG.pending;
                            const Icon = status.icon;

                            return (
                                <TableRow
                                    key={booking.id}
                                    className="hover:bg-slate-50 cursor-pointer"
                                    onClick={() => onViewDetails(booking)}
                                >
                                    <TableCell className="font-mono text-xs font-bold text-primary">
                                        #
                                        {booking.id.toString().padStart(4, "0")}
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage
                                                    src={getAvatarUrl(
                                                        booking.user,
                                                    )}
                                                />
                                                <AvatarFallback>
                                                    {getInitials(
                                                        booking.user?.name,
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <div className="font-semibold text-sm truncate">
                                                    {booking.user?.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground truncate">
                                                    {booking.user?.email}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        {booking.sweepstar ? (
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage
                                                        src={getAvatarUrl(
                                                            booking.sweepstar,
                                                        )}
                                                    />
                                                    <AvatarFallback className="bg-blue-100 text-blue-700">
                                                        {getInitials(
                                                            booking.sweepstar
                                                                .name,
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 font-semibold text-sm">
                                                    {booking.sweepstar.name}
                                                </div>
                                            </div>
                                        ) : (
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                Unassigned
                                            </Badge>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <MapPin className="w-4 h-4 text-primary/60" />{" "}
                                            {booking.address?.city}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <Clock className="w-4 h-4 text-primary/60" />{" "}
                                            {formatDate(booking.scheduled_at, {
                                                year: undefined,
                                            })}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`text-xs font-bold ${status.color} gap-1.5`}
                                        >
                                            <Icon className="w-3.5 h-3.5" />{" "}
                                            {booking.status}
                                        </Badge>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            {booking.status === "pending" && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-emerald-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onApprove(booking.id);
                                                    }}
                                                    disabled={isMutating}
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </Button>
                                            )}
                                            {(booking.status === "pending" ||
                                                booking.status ===
                                                    "confirmed") && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onReject(booking.id);
                                                    }}
                                                    disabled={isMutating}
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onViewDetails(booking);
                                                }}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </Card>
    );
}
