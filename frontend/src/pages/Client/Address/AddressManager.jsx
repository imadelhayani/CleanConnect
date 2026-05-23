// src/pages/AddressManager.jsx
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

    // [!code focus] State to track which address is being edited (null = create mode)
    const [editingAddress, setEditingAddress] = useState(null);

    // State for the confirmation modal
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        id: null,
    });

    // [!code focus] Handler for "Add New" button - Resets edit state
    const handleAddNewClick = () => {
        setEditingAddress(null);
        setIsDialogOpen(true);
    };

    // [!code focus] Handler for "Edit" button - Loads address into state
    const handleEditClick = (address) => {
        setEditingAddress(address);
        setIsDialogOpen(true);
    };

    // Handler to open the delete modal
    const handleDeleteClick = (id) => {
        setConfirmModal({
            open: true,
            id: id,
        });
        setDeleteError(null);
    };

    // Handler for the actual deletion logic
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
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Home className="w-6 h-6 text-primary" />
                            </div>
                            My Addresses
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Manage your saved service locations
                        </p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        {/* [!code focus] Update trigger to call handleAddNewClick */}
                        <DialogTrigger asChild>
                            <Button
                                onClick={handleAddNewClick}
                                className="shrink-0 rounded-lg h-11 px-6 font-semibold bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg transition-all gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add New Address
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-[500px] rounded-2xl border-border/60 bg-background/80 backdrop-blur-xl">
                            <DialogHeader className="border-b border-border/60 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        {/* [!code focus] Dynamic Icon */}
                                        {editingAddress ? (
                                            <Pencil className="w-5 h-5 text-primary" />
                                        ) : (
                                            <MapPin className="w-5 h-5 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        {/* [!code focus] Dynamic Title */}
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
                                {/* [!code focus] Pass editingAddress to the form */}
                                <AddAddressForm
                                    addressToEdit={editingAddress}
                                    onSuccess={() => setIsDialogOpen(false)}
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Statistics */}
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

                {/* Delete Error Alert */}
                {deleteError && (
                    <Alert className="border-red-200/60 bg-red-50/50 dark:bg-red-900/20 dark:border-red-800/60 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <AlertDescription className="text-red-800 dark:text-red-300">
                            {deleteError}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Content Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {loading ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                <p className="text-muted-foreground text-lg">
                                    Loading your addresses...
                                </p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="col-span-full">
                            <Alert className="border-red-200/60 bg-red-50/50 dark:bg-red-900/20 dark:border-red-800/60 rounded-lg">
                                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                <AlertDescription className="text-red-800 dark:text-red-300">
                                    Failed to load addresses. Please try again
                                    later.
                                </AlertDescription>
                            </Alert>
                        </div>
                    ) : addresses.length === 0 ? (
                        <div className="col-span-full">
                            <div className="rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 backdrop-blur-sm p-16 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 mb-6">
                                    <MapPin className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground mb-2">
                                    No addresses yet
                                </h3>
                                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                                    You haven't added any service locations. Add
                                    your first address to get started.
                                </p>
                                <Button
                                    onClick={handleAddNewClick}
                                    className="rounded-lg h-10 px-6 font-semibold bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg transition-all gap-2"
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
                                // [!code focus] Pass the new edit handler
                                onEdit={handleEditClick}
                                isDeleting={deletingId === addr.id}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
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
