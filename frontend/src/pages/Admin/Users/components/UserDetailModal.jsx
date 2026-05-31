import React from "react";
import { format } from "date-fns";
import {
    Loader2,
    User,
    Mail,
    Phone,
    Calendar,
    Star,
    Briefcase,
    DollarSign,
    MessageSquare,
    TrendingUp,
    Award,
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getRoleStyles } from "@/utils/roleStyles";
import { getInitials, getAvatarUrl } from "@/utils/avatarHelper";

import { useUserDetails } from "@/Hooks/useUsers";
import { DialogDescription } from "@radix-ui/react-dialog";

export default function UserDetailModal({ userId, isOpen, onClose }) {
    const { data: user, isLoading } = useUserDetails(userId);

    const getAverageRating = (reviews) => {
        if (!reviews || reviews.length === 0) return "N/A";
        const total = reviews.reduce((acc, r) => acc + r.rating, 0);
        return (total / reviews.length).toFixed(1);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogDescription className="sr-only">
                Modal for viewing detailed information about a user, including
                their profile info, activity, and reviews.
            </DialogDescription>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl border-border/60 bg-background/80 backdrop-blur-xl">
                {/* Header with Avatar - UPDATED */}
                <DialogHeader className="p-6 pb-6 border-b border-border/60 bg-gradient-to-r from-background to-muted/30">
                    <div className="flex flex-col items-center gap-4">
                        {/* Avatar - Using shadcn Avatar */}
                        <Avatar className="h-24 w-24 border-4 border-border/60">
                            <AvatarImage
                                src={getAvatarUrl(user)}
                                alt={user?.name}
                                className="object-cover"
                            />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-2xl font-semibold">
                                {getInitials(user?.name)}
                            </AvatarFallback>
                        </Avatar>

                        {/* Title and Info */}
                        <div className="text-center">
                            <DialogTitle className="text-2xl font-bold text-foreground">
                                {isLoading ? "Loading..." : user?.name}
                            </DialogTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                                User Profile Details
                            </p>
                        </div>

                        {/* Role Badge */}
                        {user && (
                            <Badge
                                className={`uppercase text-xs font-semibold px-3 py-1 ${getRoleStyles(
                                    user.role,
                                )}`}
                            >
                                {user.role}
                            </Badge>
                        )}
                    </div>
                </DialogHeader>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading || !user ? (
                        <div className="flex h-64 items-center justify-center">
                            <Loader2 className="animate-spin h-8 w-8 text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Basic Info Section */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-foreground flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <User className="w-4 h-4 text-primary" />
                                    </div>
                                    Basic Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        {
                                            icon: User,
                                            label: "Full Name",
                                            value: user.name,
                                        },
                                        {
                                            icon: Mail,
                                            label: "Email Address",
                                            value: user.email,
                                        },
                                        {
                                            icon: Phone,
                                            label: "Phone Number",
                                            value: user.phone || "Not provided",
                                        },
                                        {
                                            icon: Calendar,
                                            label: "Date Joined",
                                            value: format(
                                                new Date(user.created_at),
                                                "PPP",
                                            ),
                                        },
                                    ].map((item, idx) => {
                                        const Icon = item.icon;
                                        return (
                                            <div
                                                key={idx}
                                                className="rounded-lg border border-border/60 bg-muted/20 p-4 hover:bg-muted/30 transition-colors"
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Icon className="w-4 h-4 text-primary" />
                                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                        {item.label}
                                                    </span>
                                                </div>
                                                <p className="font-semibold text-foreground">
                                                    {item.value}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <Separator className="bg-border/40" />

                            {/* SWEEPSTAR SECTION */}
                            {user.role === "sweepstar" && (
                                <div className="space-y-6">
                                    <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-blue-100/60 dark:bg-blue-900/20">
                                            <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        Sweepstar Profile
                                    </h3>

                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            {
                                                icon: DollarSign,
                                                label: "Hourly Rate",
                                                value: `$${
                                                    user.sweepstar_profile
                                                        ?.hourly_rate || 0
                                                }/hr`,
                                                color: "from-emerald-100/60 to-emerald-50/60 dark:from-emerald-900/20 dark:to-emerald-900/10",
                                                iconColor:
                                                    "text-emerald-600 dark:text-emerald-400",
                                            },
                                            {
                                                icon: TrendingUp,
                                                label: "Jobs Done",
                                                value:
                                                    user.sweepstar_bookings
                                                        ?.length || 0,
                                                color: "from-blue-100/60 to-blue-50/60 dark:from-blue-900/20 dark:to-blue-900/10",
                                                iconColor:
                                                    "text-blue-600 dark:text-blue-400",
                                            },
                                            {
                                                icon: Star,
                                                label: "Average Rating",
                                                value: `${getAverageRating(
                                                    user.reviews_received,
                                                )} ★`,
                                                color: "from-amber-100/60 to-amber-50/60 dark:from-amber-900/20 dark:to-amber-900/10",
                                                iconColor:
                                                    "text-amber-600 dark:text-amber-400",
                                            },
                                        ].map((stat, idx) => {
                                            const Icon = stat.icon;
                                            return (
                                                <Card
                                                    key={idx}
                                                    className={`border-border/60 bg-gradient-to-br ${stat.color} backdrop-blur-sm`}
                                                >
                                                    <CardContent className="p-4 text-center">
                                                        <div className="flex justify-center mb-2">
                                                            <div
                                                                className={`p-2 rounded-lg bg-white/50 dark:bg-background/50`}
                                                            >
                                                                <Icon
                                                                    className={`w-5 h-5 ${stat.iconColor}`}
                                                                />
                                                            </div>
                                                        </div>
                                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                                            {stat.label}
                                                        </p>
                                                        <p className="font-bold text-lg text-foreground">
                                                            {stat.value}
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>

                                    {/* Reviews */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4 text-primary" />
                                            Reviews from Clients (
                                            {user.reviews_received?.length || 0}
                                            )
                                        </h4>
                                        {user.reviews_received &&
                                        user.reviews_received.length > 0 ? (
                                            <div className="grid gap-4">
                                                {user.reviews_received.map(
                                                    (review) => (
                                                        <div
                                                            key={review.id}
                                                            className="rounded-lg border border-border/60 bg-muted/20 p-4 hover:border-primary/30 hover:bg-muted/30 transition-all"
                                                        >
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div>
                                                                    <p className="font-semibold text-sm text-foreground">
                                                                        {review
                                                                            .reviewer
                                                                            ?.name ||
                                                                            "Anonymous"}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {format(
                                                                            new Date(
                                                                                review.created_at,
                                                                            ),
                                                                            "MMM d, yyyy",
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <div className="flex gap-0.5">
                                                                    {[
                                                                        ...Array(
                                                                            5,
                                                                        ),
                                                                    ].map(
                                                                        (
                                                                            _,
                                                                            i,
                                                                        ) => (
                                                                            <Star
                                                                                key={
                                                                                    i
                                                                                }
                                                                                className={`w-4 h-4 ${
                                                                                    i <
                                                                                    review.rating
                                                                                        ? "fill-amber-400 text-amber-400"
                                                                                        : "text-muted/30"
                                                                                }`}
                                                                            />
                                                                        ),
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground italic">
                                                                "
                                                                {review.comment ||
                                                                    "No comment provided"}
                                                                "
                                                            </p>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border-2 border-dashed border-border/40 p-8 text-center">
                                                <Award className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                                                <p className="text-muted-foreground">
                                                    No reviews received yet
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* CLIENT SECTION */}
                            {user.role === "client" && (
                                <div className="space-y-6">
                                    <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-purple-100/60 dark:bg-purple-900/20">
                                            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        Client Activity
                                    </h3>

                                    {/* Bookings */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                                            <Briefcase className="w-4 h-4 text-primary" />
                                            Recent Bookings (
                                            {user.client_bookings?.length || 0})
                                        </h4>
                                        {user.client_bookings &&
                                        user.client_bookings.length > 0 ? (
                                            <div className="grid gap-3">
                                                {user.client_bookings.map(
                                                    (booking) => (
                                                        <div
                                                            key={booking.id}
                                                            className="rounded-lg border border-border/60 bg-muted/20 p-4 hover:border-primary/30 hover:bg-muted/30 transition-all"
                                                        >
                                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                                                                <div>
                                                                    <p className="font-semibold text-foreground">
                                                                        {booking.bookingServices
                                                                            ?.map(
                                                                                (
                                                                                    bs,
                                                                                ) =>
                                                                                    bs
                                                                                        .service
                                                                                        ?.name,
                                                                            )
                                                                            .filter(
                                                                                Boolean,
                                                                            )
                                                                            .join(
                                                                                ", ",
                                                                            )}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                                        <Calendar className="w-3 h-3" />
                                                                        {format(
                                                                            new Date(
                                                                                booking.scheduled_at,
                                                                            ),
                                                                            "PPP p",
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="capitalize"
                                                                    >
                                                                        {
                                                                            booking.status
                                                                        }
                                                                    </Badge>
                                                                    <p className="font-bold text-lg text-foreground">
                                                                        $
                                                                        {
                                                                            booking.total_price
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {booking.sweepstar && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    <span className="font-medium">
                                                                        Sweepstar:
                                                                    </span>{" "}
                                                                    {
                                                                        booking
                                                                            .sweepstar
                                                                            .name
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border-2 border-dashed border-border/40 p-8 text-center">
                                                <Briefcase className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                                                <p className="text-muted-foreground">
                                                    No bookings made yet
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Reviews Written */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4 text-primary" />
                                            Reviews Written (
                                            {user.reviews_written?.length || 0})
                                        </h4>
                                        {user.reviews_written &&
                                        user.reviews_written.length > 0 ? (
                                            <div className="grid gap-3">
                                                {user.reviews_written.map(
                                                    (review) => (
                                                        <div
                                                            key={review.id}
                                                            className="rounded-lg border border-border/60 bg-muted/20 p-4 hover:border-primary/30 hover:bg-muted/30 transition-all"
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <p className="text-sm text-foreground">
                                                                    Reviewed{" "}
                                                                    <span className="font-semibold">
                                                                        {review
                                                                            .target
                                                                            ?.name ||
                                                                            "a Sweepstar"}
                                                                    </span>
                                                                </p>
                                                                <div className="flex gap-0.5">
                                                                    {[
                                                                        ...Array(
                                                                            5,
                                                                        ),
                                                                    ].map(
                                                                        (
                                                                            _,
                                                                            i,
                                                                        ) => (
                                                                            <Star
                                                                                key={
                                                                                    i
                                                                                }
                                                                                className={`w-3 h-3 ${
                                                                                    i <
                                                                                    review.rating
                                                                                        ? "fill-amber-400 text-amber-400"
                                                                                        : "text-muted/30"
                                                                                }`}
                                                                            />
                                                                        ),
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground italic">
                                                                "
                                                                {review.comment}
                                                                "
                                                            </p>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border-2 border-dashed border-border/40 p-8 text-center">
                                                <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                                                <p className="text-muted-foreground">
                                                    No reviews written yet
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
