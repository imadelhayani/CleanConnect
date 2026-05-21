import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Loader2,
    Menu,
    X,
    LogOut,
    LayoutDashboard,
    UserCircle2,
    Home,
    Mail,
    ChevronDown,
    Coins,
} from "lucide-react";

import { ModeButton } from "@/components/ui/Button-mode";
import { useUser, useLogout } from "@/Hooks/useAuth";
import { getInitials, getAvatarUrl } from "@/utils/avatarHelper";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getRoleStyles } from "@/utils/roleStyles";

// Import the notification bell
import NotificationBell from "./NotificationBell";

export default function NavBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const { data: user, isLoading } = useUser();
    const { mutateAsync: logoutUser } = useLogout();

    const handleLogout = async () => {
        try {
            await logoutUser();
            setIsOpen(false);
            navigate("/login");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const toggleMenu = () => setIsOpen((prev) => !prev);
    const closeMenu = () => setIsOpen(false);

    const getDashboardRoute = () => {
        if (!user) return "/login";
        return "/dashboard";
    };

    const isActive = (path) =>
        location.pathname === path ||
        (path !== "/" && location.pathname.startsWith(path));

    const DesktopNavLink = ({ to, children }) => (
        <Link
            to={to}
            className={`group relative px-4 py-2 text-sm font-medium transition-colors ${
                isActive(to)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
            }`}
        >
            <span className="flex items-center gap-2">{children}</span>
            <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary via-primary to-transparent transition-all group-hover:w-full" />
        </Link>
    );

    const MobileNavLink = ({ to, children, onClick }) => (
        <Link
            to={to}
            onClick={() => {
                if (onClick) onClick();
                closeMenu();
            }}
            className={`block rounded-md px-3 py-2.5 text-sm font-medium transition-all ${
                isActive(to)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
        >
            {children}
        </Link>
    );

    return (
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
            <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Brand */}
                <Link
                    to="/"
                    onClick={closeMenu}
                    className="flex items-center gap-2 text-lg font-semibold tracking-tight hover:opacity-80 transition-opacity"
                >
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-sm">
                        CC
                    </div>
                    <span className="text-foreground">CleanConnect</span>
                </Link>

                {/* Center links (desktop) */}
                <div className="hidden md:flex items-center gap-1">
                    <DesktopNavLink to="/">
                        <Home className="w-4 h-4" />
                        Home
                    </DesktopNavLink>
                    <DesktopNavLink to="/contact">
                        <Mail className="w-4 h-4" />
                        Contact
                    </DesktopNavLink>
                </div>

                {/* Right side (desktop) */}
                <div className="hidden md:flex items-center gap-3">
                    <ModeButton />

                    {/* Notification Bell */}
                    {user && <NotificationBell />}

                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : !user ? (
                        // Not logged in - show Login & Sign Up
                        <>
                            <DesktopNavLink to="/login">Login</DesktopNavLink>
                            <Button
                                asChild
                                size="sm"
                                className="rounded-full px-6 font-medium"
                            >
                                <Link to="/signup">Sign Up</Link>
                            </Button>
                        </>
                    ) : (
                        // Logged in - show User Dropdown
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2 rounded-full px-1.5 py-1.5"
                                >
                                    <Avatar className="h-6 w-6 border border-border/60">
                                        <AvatarImage
                                            src={getAvatarUrl(user)}
                                            alt={user?.name}
                                            className="object-cover"
                                        />
                                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xs font-bold">
                                            {getInitials(user?.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium hidden sm:inline">
                                        {user?.name || "Account"}
                                    </span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                    <div className="flex flex-col gap-3">
                                        {/* Avatar + Name */}
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border border-border/60">
                                                <AvatarImage
                                                    src={getAvatarUrl(user)}
                                                    alt={user?.name}
                                                    className="object-cover"
                                                />
                                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xs font-bold">
                                                    {getInitials(user?.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground truncate">
                                                    {user?.name || "User"}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {user?.email || "no email"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Role Badge */}
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider w-fit ${getRoleStyles(
                                                user?.role,
                                            )}`}
                                        >
                                            {user?.role || "User"}
                                        </span>

                                        {user?.role === "sweepstar" && (
                                            <div className="mt-2 flex items-center justify-between rounded-md bg-primary/10 px-2 py-1">
                                                <span className="text-xs font-medium">
                                                    Points:
                                                </span>
                                                <span className="text-sm font-bold text-primary">
                                                    {user?.sweepstarProfile
                                                        ?.points_balance || 0}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => {
                                        navigate(getDashboardRoute());
                                        closeMenu();
                                    }}
                                    className="cursor-pointer gap-2"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span>Dashboard</span>
                                </DropdownMenuItem>
                                {user?.role === "sweepstar" && (
                                    <DropdownMenuItem
                                        onClick={() =>
                                            navigate("/dashboard/top-up-points")
                                        }
                                        className="cursor-pointer gap-2"
                                    >
                                        <Coins className="h-4 w-4" />
                                        <span>Top Up Points</span>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {/* Mobile: theme + hamburger */}
                <div className="flex items-center gap-3 md:hidden">
                    <ModeButton />

                    {/* Notification Bell for Mobile */}
                    {user && <NotificationBell />}

                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-accent"
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        {isOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </nav>

            {/* Mobile sheet */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent side="top" className="pt-4">
                    <SheetHeader className="mb-4 px-1">
                        <SheetTitle className="flex items-center gap-2 text-base font-semibold text-left">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-xs">
                                CC
                            </div>
                            <span className="text-foreground">
                                CleanConnect
                            </span>
                        </SheetTitle>
                    </SheetHeader>

                    <div className="space-y-2">
                        <MobileNavLink to="/">
                            <span className="inline-flex items-center gap-2">
                                <Home className="h-4 w-4" />
                                Home
                            </span>
                        </MobileNavLink>
                        <MobileNavLink to="/contact">
                            <span className="inline-flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Contact
                            </span>
                        </MobileNavLink>

                        {isLoading ? (
                            <div className="flex justify-center py-3 text-muted-foreground">
                                <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                        ) : !user ? (
                            // Not logged in - show Login & Sign Up
                            <>
                                <MobileNavLink to="/login">Login</MobileNavLink>
                                <MobileNavLink to="/signup">
                                    Sign Up
                                </MobileNavLink>
                            </>
                        ) : (
                            // Logged in - show User Info & Dashboard/Logout
                            <>
                                {/* User Info Card */}
                                <div className="mt-3 mb-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-border/60 flex-shrink-0">
                                            <AvatarImage
                                                src={getAvatarUrl(user)}
                                                alt={user?.name}
                                                className="object-cover"
                                            />
                                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xs font-bold">
                                                {getInitials(user?.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-foreground truncate">
                                                {user?.name || "User"}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate">
                                                {user?.email || "no email"}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                                        {user?.role || "User"}
                                    </div>
                                </div>

                                <MobileNavLink to={getDashboardRoute()}>
                                    <span className="inline-flex items-center gap-2">
                                        <LayoutDashboard className="h-4 w-4" />
                                        Dashboard
                                    </span>
                                </MobileNavLink>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </header>
    );
}
