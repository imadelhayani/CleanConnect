import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Users, Loader2, AlertCircle, RefreshCcw } from "lucide-react";
import { useUser } from "@/Hooks/useAuth";
import { useUsers } from "@/Hooks/useUsers";
import PaginationComponent from "@/components/ui/PaginationComponent";
import UsersStatCards from "./components/UsersStatCards";
import UsersFilter from "./components/UsersFilter";
import UsersTable from "./components/UsersTable";
import UserDetailModal from "./components/UserDetailModal";
import AdminDeleteUserModal from "./components/AdminDeleteUserModal";
import UserEditProfileModal from "../../SharedComponents/components/User/UserEditProfileModal";

export default function UsersManager() {
    const [page, setPage] = useState(1);
    const { data: paginatedData, loading, error, refetch } = useUsers(page);

    const users = paginatedData?.data ?? [];
    const stats = paginatedData?.stats ?? {
        total: 0,
        active: 0,
        suspended: 0,
        deleted: 0,
    };
    const meta = paginatedData
        ? {
              current_page: paginatedData.current_page,
              last_page: paginatedData.last_page,
              per_page: paginatedData.per_page,
              total: paginatedData.total,
          }
        : null;

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
        return (
            ((user.name || "").toLowerCase().includes(term) ||
                (user.email || "").toLowerCase().includes(term) ||
                String(user.id || "").includes(term)) &&
            (roleFilter === "all" || user.role === roleFilter)
        );
    });

    if (loading)
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    if (error)
        return (
            <div className="p-6">
                <AlertCircle /> {error}
            </div>
        );

    return (
        <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-primary/8 to-transparent p-8 md:p-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/80 border mb-6">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">User Management</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                    User Management
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                    Manage {meta?.total || 0} registered users
                </p>
            </div>

            <div className="flex justify-end">
                <RefreshCcw onClick={refetch} className="cursor-pointer" />
            </div>
            <UsersStatCards stats={stats} />
            <div className="rounded-xl border border-border/60 bg-background/50 p-6">
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
                {meta && meta.last_page > 1 && (
                    <PaginationComponent meta={meta} onPageChange={setPage} />
                )}
            </div>

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
