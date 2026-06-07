import React, { useState } from "react";
import { LayoutGrid, Loader2 } from "lucide-react";
import { useServices, useDeleteService } from "@/Hooks/useServices";
import ServiceStats from "./components/ServiceStats";
import ServiceCard from "./components/ServiceCard";
import ServiceDetailsModal from "./components/ServiceDetailsModal";
import ServiceUpdateModal from "./components/ServiceUpdateModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { ContentLoader } from "@/components/ui/PageLoader";

export default function ServiceManager() {
    const { data: services = [], isLoading } = useServices();
    const deleteMutation = useDeleteService();
    const [selectedService, setSelectedService] = useState(null);
    const [modalState, setModalState] = useState({
        details: false,
        update: false,
        delete: false,
    });

    if (isLoading) return <ContentLoader />;

    const handleDetailsClick = (service) => {
        setSelectedService(service);
        setModalState((prev) => ({ ...prev, details: true }));
    };
    const handleEditClick = (service) => {
        setSelectedService(service);
        setModalState((prev) => ({ ...prev, update: true }));
    };
    const handleDeleteClick = (id) => {
        setSelectedService({ id });
        setModalState((prev) => ({ ...prev, delete: true }));
    };
    const confirmDelete = async () => {
        if (selectedService?.id)
            await deleteMutation.mutateAsync(selectedService.id);
        setModalState((prev) => ({ ...prev, delete: false }));
        setSelectedService(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-4 md:p-6 max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-primary/8 to-transparent p-8 md:p-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/80 border mb-6">
                    <LayoutGrid className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Service Catalog</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                    Services Management
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                    View details and update pricing configuration.
                </p>
            </div>
            <ServiceStats services={services} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                    <ServiceCard
                        key={service.id}
                        service={service}
                        onDetails={handleDetailsClick}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                    />
                ))}
            </div>
            <ServiceDetailsModal
                isOpen={modalState.details}
                onClose={() =>
                    setModalState((prev) => ({ ...prev, details: false }))
                }
                service={selectedService}
            />
            <ServiceUpdateModal
                isOpen={modalState.update}
                onClose={() =>
                    setModalState((prev) => ({ ...prev, update: false }))
                }
                service={selectedService}
            />
            <ConfirmationModal
                open={modalState.delete}
                onClose={() =>
                    setModalState((prev) => ({ ...prev, delete: false }))
                }
                onConfirm={confirmDelete}
                title="Delete Service?"
                description="This will permanently remove the service and all its pricing options."
                variant="destructive"
                confirmText="Delete"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
