import React, { useState } from "react";
import { Loader2, AlertCircle, Plus, MapPin, Home, Pencil } from "lucide-react";

import { useAddress } from "@/Hooks/useAddress";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import AddressCard from "./components/AddressCard";
import AddAddressForm from "./components/AddAddressForm";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

export default function AddressManager() {
    const { addresses = [], loading, error, deleteAddress } = useAddress();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [deleteError, setDeleteError] = useState(null);
    const [editingAddress, setEditingAddress] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ open: false, id: null });

    const handleAddNewClick = () => {
        setEditingAddress(null);
        setIsDialogOpen(true);
    };

    const handleEditClick = (address) => {
        setEditingAddress(address);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (id) => {
        setConfirmModal({ open: true, id });
        setDeleteError(null);
    };

    const handleConfirmDelete = async () => {
        const id = confirmModal.id;
        if (!id) return;
        setDeletingId(id);
        try {
            await deleteAddress(id);
            setConfirmModal({ open: false, id: null });
        } catch (err) {
            console.error(err);
            setDeleteError("Could not delete address. Please try again.");
            setConfirmModal({ open: false, id: null });
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-4 md:p-6 max-w-7xl mx-auto">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-primary/8 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent p-8 md:p-12">
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/15 rounded-full blur-3xl dark:bg-primary/10" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl dark:bg-primary/5" />
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/80 border mb-6">
                        <Home className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">
                            Saved Locations
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        My Addresses
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        Manage your saved service locations
                    </p>
                </div>
            </div>

            {/* Stats Card */}
            {!loading && !error && (
                <Card className="rounded-xl border-border/60 bg-background/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total Addresses
                                </p>
                                <p className="text-3xl font-bold text-foreground mt-2">
                                    {addresses.length}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-primary/10">
                                <MapPin className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Delete Error */}
            {deleteError && (
                <Alert className="border-red-200/60 bg-red-50/50 dark:bg-red-900/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                        {deleteError}
                    </AlertDescription>
                </Alert>
            )}

            {/* Add Address Button & Dialog */}
            <div className="flex justify-end">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={handleAddNewClick}
                            className="gap-2 rounded-lg h-11 px-6 font-semibold bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg"
                        >
                            <Plus className="w-4 h-4" />
                            Add New Address
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] rounded-2xl">
                        <DialogHeader className="border-b border-border/60 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    {editingAddress ? (
                                        <Pencil className="w-5 h-5 text-primary" />
                                    ) : (
                                        <MapPin className="w-5 h-5 text-primary" />
                                    )}
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl">
                                        {editingAddress
                                            ? "Edit Address"
                                            : "Add New Address"}
                                    </DialogTitle>
                                    <DialogDescription className="mt-1">
                                        {editingAddress
                                            ? "Update your location details below"
                                            : "Enter your location details below"}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                        <div className="pt-6">
                            <AddAddressForm
                                addressToEdit={editingAddress}
                                onSuccess={() => setIsDialogOpen(false)}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Address Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-muted-foreground text-lg mt-4">
                            Loading your addresses...
                        </p>
                    </div>
                ) : error ? (
                    <div className="col-span-full">
                        <Alert className="border-red-200/60 bg-red-50/50 rounded-lg">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription>
                                Failed to load addresses. Please try again
                                later.
                            </AlertDescription>
                        </Alert>
                    </div>
                ) : addresses.length === 0 ? (
                    <div className="col-span-full">
                        <div className="rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 p-16 text-center">
                            <MapPin className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-foreground mb-2">
                                No addresses yet
                            </h3>
                            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                                You haven't added any service locations. Add
                                your first address to get started.
                            </p>
                            <Button
                                onClick={handleAddNewClick}
                                className="gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Your First Address
                            </Button>
                        </div>
                    </div>
                ) : (
                    addresses.map((addr) => (
                        <AddressCard
                            key={addr.id}
                            address={addr}
                            onDelete={handleDeleteClick}
                            onEdit={handleEditClick}
                            isDeleting={deletingId === addr.id}
                        />
                    ))
                )}
            </div>

            <ConfirmationModal
                open={confirmModal.open}
                onClose={() =>
                    setConfirmModal({ ...confirmModal, open: false })
                }
                onConfirm={handleConfirmDelete}
                title="Delete Address?"
                description="Are you sure you want to remove this address from your account? This action cannot be undone."
                variant="destructive"
                confirmText="Delete Address"
                isLoading={!!deletingId}
            />
        </div>
    );
}
