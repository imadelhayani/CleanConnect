import React, { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Loader2,
    User,
    Mail,
    Phone,
    Edit2,
    ShieldCheck,
    Trash2,
    Power,
    Sparkles,
    CheckCircle2,
    AlertTriangle,
    Copy,
} from "lucide-react";
import { useDeleteAccount, useToggleStatus, useUser } from "@/Hooks/useAuth";
import { getRoleStyles } from "@/utils/roleStyles";
import UserEditProfileModal from "./components/User/UserEditProfileModal";
import DeleteAccountModal from "./components/User/DeleteAccountModal";
import AvatarUpload from "./AvatarUpload";
import { ContentLoader } from "@/components/ui/PageLoader";

export default function UserInfo() {
    const { data: user, isLoading } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [copiedId, setCopiedId] = useState(false);
    const { mutate: toggleStatus, isPending: isTogglingStatus } =
        useToggleStatus();
    const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();

    const handleCopyId = () => {
        navigator.clipboard.writeText(user.id);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    if (isLoading) return <ContentLoader />;

    if (!user) return null;

    const isAdmin = user.role === "admin";
    const isActive = user.status === "active";

    return (
        <>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 md:p-6 max-w-5xl mx-auto">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-primary/8 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent p-8 md:p-12">
                    {/* Decorative Blobs */}
                    <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/15 rounded-full blur-3xl dark:bg-primary/10"></div>
                    <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl dark:bg-primary/5"></div>

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            {/* Profile Avatar & Basic Info */}
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <AvatarUpload user={user} />
                                </div>

                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                                            {user.name}
                                        </h1>
                                        {!isAdmin && isActive && (
                                            <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                Active
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-yellow-500" />
                                        {isAdmin
                                            ? "Administrator Account"
                                            : "Member Account"}
                                    </p>
                                </div>
                            </div>

                            {/* Role Badge */}
                            <Badge
                                className={`text-sm px-4 py-2.5 font-bold tracking-wider uppercase ${getRoleStyles(
                                    user.role,
                                )}`}
                            >
                                {user.role}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Main Content Card */}
                <Card className="border-primary/20 shadow-xl">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <ShieldCheck className="w-6 h-6 text-primary" />
                                    Account Information
                                </CardTitle>
                                <CardDescription className="mt-2">
                                    View and manage your profile details
                                </CardDescription>
                            </div>
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg transition-all"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit Profile
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-8">
                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Name */}
                            <div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-slate-50 dark:from-slate-800/60 to-slate-100/50 dark:to-slate-900/30 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-md transition-all">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Full Name
                                    </p>
                                </div>
                                <p className="text-lg font-bold text-foreground ml-2">
                                    {user.name}
                                </p>
                            </div>

                            {/* Email */}
                            <div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-slate-50 dark:from-slate-800/60 to-slate-100/50 dark:to-slate-900/30 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-md transition-all">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                        <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Email Address
                                    </p>
                                </div>
                                <p className="text-lg font-bold text-foreground ml-2 break-all">
                                    {user.email}
                                </p>
                            </div>

                            {/* Phone */}
                            <div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-slate-50 dark:from-slate-800/60 to-slate-100/50 dark:to-slate-900/30 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-md transition-all">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                        <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Phone Number
                                    </p>
                                </div>
                                <p className="text-lg font-bold text-foreground ml-2">
                                    {user.phone || (
                                        <span className="text-muted-foreground font-normal italic">
                                            Not provided
                                        </span>
                                    )}
                                </p>
                            </div>

                            {/* User ID */}
                            <div className="space-y-2 p-5 rounded-xl bg-gradient-to-br from-slate-50 dark:from-slate-800/60 to-slate-100/50 dark:to-slate-900/30 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-md transition-all">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                        <ShieldCheck className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        User ID
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                    <p className="text-lg font-bold text-foreground font-mono">
                                        #{user.id}
                                    </p>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0"
                                        onClick={handleCopyId}
                                    >
                                        <Copy
                                            className={`w-4 h-4 transition-colors ${
                                                copiedId ? "text-green-500" : ""
                                            }`}
                                        />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Settings - Hidden for Admins */}
                {!isAdmin && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Power className="w-6 h-6 text-primary" />
                            Account Settings
                        </h2>

                        {/* Status Toggle Card */}
                        <Card className="border-primary/20 shadow-lg">
                            <CardContent className="pt-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-6 rounded-xl bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-blue-100/50 dark:to-blue-900/10 border border-blue-200 dark:border-blue-800/50">
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            Account Status
                                        </h3>
                                        <p className="text-muted-foreground">
                                            {isActive
                                                ? "Your account is visible and active. You can receive missions and bookings."
                                                : "Your account is currently disabled. You won't receive new opportunities."}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-3">
                                        <Badge
                                            className={`px-4 py-2 font-bold uppercase tracking-wider ${
                                                isActive
                                                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400"
                                            }`}
                                        >
                                            {isActive
                                                ? "✓ Active"
                                                : "○ Disabled"}
                                        </Badge>
                                        <Button
                                            onClick={() => toggleStatus()}
                                            disabled={isTogglingStatus}
                                            variant={
                                                isActive
                                                    ? "destructive"
                                                    : "default"
                                            }
                                            className="gap-2"
                                        >
                                            {isTogglingStatus ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Updating...
                                                </>
                                            ) : isActive ? (
                                                <>
                                                    <Power className="w-4 h-4" />
                                                    Disable Account
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Activate Account
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Delete Account - Danger Zone */}
                        <Alert className="border-red-200 dark:border-red-800/50 bg-red-50/80 dark:bg-red-900/20">
                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            <div className="ml-2 flex-1">
                                <AlertTitle className="text-red-900 dark:text-red-300 font-bold text-lg">
                                    Danger Zone
                                </AlertTitle>
                                <AlertDescription className="text-red-800 dark:text-red-400 mt-2 mb-4">
                                    Deleting your account is permanent and
                                    irreversible. All your data, including
                                    profile, history, and reviews will be
                                    permanently removed. This action cannot be
                                    undone.
                                </AlertDescription>
                                <Button
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    variant="destructive"
                                    className="gap-2 shadow-lg"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            Delete My Account
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Alert>
                    </div>
                )}

                {/* Admin Indicator */}
                {isAdmin && (
                    <Alert className="border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <AlertTitle className="text-foreground font-semibold">
                            Administrator Account
                        </AlertTitle>
                        <AlertDescription className="text-muted-foreground mt-2">
                            As an admin, account status and deletion options are
                            restricted. Contact support if you need to modify
                            your admin account.
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            {/* Modals */}
            <UserEditProfileModal
                user={user}
                editor={user}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
            <DeleteAccountModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
            />
        </>
    );
}
