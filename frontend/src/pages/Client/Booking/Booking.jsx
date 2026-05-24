import React, { useState, useMemo } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useAddress } from "@/Hooks/useAddress";
import { useServices } from "@/Hooks/useServices";
import { useCreateBooking } from "@/Hooks/useBookings";
import BookingForm from "./components/BookingForm";
import SuccessBookingModal from "./components/SuccessBookingModal";

export default function Booking() {
    const { data: services = [], isLoading: loadingServices } = useServices();
    const { addresses: addressData, loading: loadingAddresses } = useAddress();
    const {
        mutateAsync: createBookingMutation,
        isPending: isBookingSubmitting,
    } = useCreateBooking();

    const [isSuccess, setIsSuccess] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const verifiedAddresses = useMemo(() => {
        if (Array.isArray(addressData)) return addressData;
        if (addressData?.data && Array.isArray(addressData.data))
            return addressData.data;
        return [];
    }, [addressData]);

    if (loadingServices || loadingAddresses) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground text-lg">
                        Preparing your booking experience...
                    </p>
                </div>
            </div>
        );
    }

    const handleFormSubmit = async (formData) => {
        setSubmitError(null);
        try {
            const payload = {
                service_id: Number(formData.service_id),
                address_id: Number(formData.address_id),
                scheduled_at: formData.scheduled_at,
                options: (formData.options || []).map((id) => Number(id)),
                extras: (formData.extras || []).map((id) => Number(id)),
                final_price: Number(formData.final_price),
                notes: formData.notes || "",
            };

            const response = await createBookingMutation(payload);
            if (response) setIsSuccess(true);
        } catch (error) {
            const serverError =
                error.response?.data?.message || "Booking failed.";
            setSubmitError(serverError);
            console.error("Backend Error:", error.response?.data);
        }
    };

    if (isSuccess) return <SuccessBookingModal />;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-4 md:p-6 max-w-7xl mx-auto">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-primary/8 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent p-8 md:p-12">
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/15 rounded-full blur-3xl dark:bg-primary/10" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl dark:bg-primary/5" />
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/80 border mb-6">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">New Request</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Book a Service
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        Customize your plan, choose a location, and let us
                        handle the rest.
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <div className="rounded-xl border-border/60 bg-background/50 backdrop-blur-sm shadow-lg">
                {submitError && (
                    <div className="p-4 bg-destructive/10 border-b border-destructive/20 text-destructive rounded-t-xl text-sm font-medium">
                        {submitError}
                    </div>
                )}
                <div className="p-6">
                    <BookingForm
                        services={services}
                        addresses={verifiedAddresses}
                        onSubmit={handleFormSubmit}
                        isSubmitting={isBookingSubmitting}
                    />
                </div>
            </div>
        </div>
    );
}
