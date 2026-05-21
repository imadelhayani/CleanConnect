// src/layout/Sidebar/Sidebar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useLogout } from "@/Hooks/useAuth";

import {
    LayoutDashboard,
    UserRoundCog,
    Users,
    Calendar,
    Briefcase,
    Settings,
    LogOut,
    PlusCircle,
    Wrench,
    BrushCleaning,
    MapPin,
    ListChecks,
    Wallet,
    Coins,
    History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRoleStyles } from "@/utils/roleStyles";

export default function Sidebar() {
    const navigate = useNavigate();
    const { data: user, isLoading } = useUser();
    const [activePage, setActivePage] = useState("dashboard");
    const { mutateAsync: logoutUser } = useLogout();

    const role = user?.role || "client";

    const handleLogout = async () => {
        try {
            await logoutUser();
            navigate("/login");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const MENUS = {
        admin: [
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            {
                id: "myInformations",
                label: "My Informations",
                icon: UserRoundCog,
            },
            { id: "usersList", label: "Users List", icon: Users },
            { id: "bookingsList", label: "Bookings List", icon: Calendar },
            { id: "services", label: "Services", icon: Wrench },
            {
                id: "sweepstarRequests",
                label: "Sweepstar Requests",
                icon: Settings,
            },
            {
                id: "paymentVerifications",
                label: "Payment Verifications",
                icon: Wallet,
            },
            {
                id: "settings",
                label: "Settings",
                icon: Settings,
            },
        ],
        sweepstar: [
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            {
                id: "myInformations",
                label: "My Informations",
                icon: UserRoundCog,
            },
            {
                id: "availableMissions",
                label: "Available Missions",
                icon: ListChecks,
            },
            {
                id: "currentMissions",
                label: "Current Missions",
                icon: Calendar,
            },
            {
                id: "missionsHistory",
                label: "Missions History",
                icon: Briefcase,
            },
            {
                id: "topUpPoints",
                label: "Top Up Points",
                icon: Coins,
            },
            {
                id: "pointTransactions",
                label: "Point Transactions",
                icon: History,
            },
        ],
        client: [
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            {
                id: "myInformations",
                label: "My Informations",
                icon: UserRoundCog,
            },
            { id: "bookService", label: "Book Service", icon: PlusCircle },
            {
                id: "bookingsHistory",
                label: "Bookings History",
                icon: Briefcase,
            },
            { id: "myAddresses", label: "My Addresses", icon: MapPin },
            {
                id: "becomeSweepstar",
                label: "Become Sweepstar",
                icon: BrushCleaning,
            },
        ],
    };

    const currentMenu = MENUS[role] || MENUS.client;
    const routeMap = {
        // shared
        dashboard: "/dashboard",
        myInformations: "/dashboard/my_informations",

        // admin
        usersList: "/dashboard/users_list",
        bookingsList: "/dashboard/bookings_list",
        services: "/dashboard/services",
        sweepstarRequests: "/dashboard/sweepstar_requests",
        paymentVerifications: "/dashboard/payment-verifications",
        settings: "/dashboard/settings",

        // sweepstar
        availableMissions: "/dashboard/available_missions",
        currentMissions: "/dashboard/current_missions",
        missionsHistory: "/dashboard/missions_history",
        topUpPoints: "/dashboard/top-up-points",
        pointTransactions: "/dashboard/point-transactions",

        // client
        bookService: "/dashboard/booking_service",
        bookingsHistory: "/dashboard/bookings_history",
        myAddresses: "/dashboard/my_addresses",
        becomeSweepstar: "/dashboard/become_sweepstar",
    };

    const handleMenuClick = (id) => {
        setActivePage(id);
        const to = routeMap[id] || "/dashboard";
        navigate(to);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <aside className="w-64 border-r border-border/60 bg-background/95 backdrop-blur-sm flex flex-col shadow-sm transition-all duration-300">
            {/* Header */}
            <div className="p-6 border-b border-border/60">
                <h2 className="text-lg font-bold flex items-center gap-3 text-foreground">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-lg flex items-center justify-center text-sm font-bold shadow-md">
                        {role.charAt(0).toUpperCase()}
                    </div>
                    <span>
                        Dash<span className="text-primary">Board</span>
                    </span>
                </h2>
                <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest font-semibold">
                    {role} Panel
                </p>
            </div>

            {/* Menu items */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {currentMenu.map((item) => {
                    const isActive = activePage === item.id;
                    const Icon = item.icon;

                    return (
                        <Button
                            key={item.id}
                            onClick={() => handleMenuClick(item.id)}
                            variant={isActive ? "default" : "ghost"}
                            className={`w-full justify-start gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 group ${
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-md hover:bg-primary hover:shadow-lg"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            }`}
                        >
                            <Icon
                                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                                    isActive
                                        ? "text-primary-foreground"
                                        : "text-muted-foreground group-hover:text-accent-foreground"
                                }`}
                            />
                            <span className="truncate">{item.label}</span>
                        </Button>
                    );
                })}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-border/60 bg-muted/30">
                <div className="rounded-lg bg-background/60 border border-border/60 p-3 mb-3">
                    <p className="text-xs font-semibold text-foreground truncate">
                        {user?.name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {user?.email || "no email"}
                    </p>
                    <div
                        className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${getRoleStyles(
                            user?.role,
                        )}`}
                    >
                        {role}
                    </div>
                </div>

                {/* Logout Button */}
                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start gap-3 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 group"
                >
                    <LogOut className="w-5 h-5 group-hover:text-destructive" />
                    Logout
                </Button>
            </div>
        </aside>
    );
}
