import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Users, Loader2, AlertCircle, RefreshCcw } from "lucide-react";
import { useUser } from "@/Hooks/useAuth";
import { useUsers } from "@/Hooks/useUsers";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

import UsersStatCards from "./components/UsersStatCards";
import UsersFilter from "./components/UsersFilter";
import UsersTable from "./components/UsersTable";
import UserDetailModal from "./components/UserDetailModal";
import AdminDeleteUserModal from "./components/AdminDeleteUserModal";
import UserEditProfileModal from "../../SharedComponents/components/User/UserEditProfileModal";

export default function UsersManager() {
    const { users, loading, error, refetch } = useUsers();
    const { data: currentUser } = useUser();

    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const location = useLocation();

    useEffect(() => {
        if (location.state?.openUserId) {
            setSelectedUserId(location.state.openUserId);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const filteredUsers = users.filter((user) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
            (user.name || "").toLowerCase().includes(term) ||
            (user.email || "").toLowerCase().includes(term) ||
            String(user.id || "").includes(term);
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground text-lg">
                        Loading users...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Alert className="border-red-200/60 bg-red-50/50 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                        {error}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-4 md:p-6 max-w-7xl mx-auto">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-primary/8 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent p-8 md:p-12">
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/15 rounded-full blur-3xl dark:bg-primary/10" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl dark:bg-primary/5" />
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/80 border mb-6">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">
                            User Management
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        User Management
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        Manage and monitor {users.length} registered users
                    </p>
                </div>
            </div>

            {/* Refresh Button */}
            <div className="flex justify-end">
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={refetch}
                >
                    <RefreshCcw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <UsersStatCards users={users} />

            {/* Main Card */}
            <Card className="rounded-xl border-border/60 bg-background/50 backdrop-blur-sm shadow-lg">
                <CardHeader className="border-b border-border/60 pb-4">
                    <CardTitle className="text-2xl">User Directory</CardTitle>
                    <CardDescription>
                        Filter and manage all users in the system
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <UsersFilter
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        roleFilter={roleFilter}
                        setRoleFilter={setRoleFilter}
                    />
                    <UsersTable
                        users={filteredUsers}
                        currentUser={currentUser}
                        selectedUserId={selectedUserId}
                        setSelectedUserId={setSelectedUserId}
                        setSelectedUserForEdit={setSelectedUserForEdit}
                        setIsEditModalOpen={setIsEditModalOpen}
                        setUserToDelete={setUserToDelete}
                    />
                </CardContent>
            </Card>

            {/* Modals */}
            {selectedUserId && (
                <UserDetailModal
                    userId={selectedUserId}
                    isOpen={!!selectedUserId}
                    onClose={() => setSelectedUserId(null)}
                />
            )}
            {selectedUserForEdit && currentUser && (
                <UserEditProfileModal
                    user={selectedUserForEdit}
                    editor={currentUser}
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedUserForEdit(null);
                        refetch();
                    }}
                />
            )}
            {userToDelete && (
                <AdminDeleteUserModal
                    isOpen={!!userToDelete}
                    user={userToDelete}
                    onClose={() => setUserToDelete(null)}
                />
            )}
        </div>
    );
}
