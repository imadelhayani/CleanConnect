import React, { useState } from "react";
import { Sparkles, Shield } from "lucide-react";
import {
    useApplyForSweepstar,
    useCheckApplicationStatus,
} from "@/Hooks/useSweepstar";
import BecomeProForm from "./components/BecomeProForm";
import SweepstarApplicationStatusModal from "./components/SweepstarApplicationStatusModal";
import { ContentLoader } from "@/components/ui/PageLoader";

export default function SweepstarApply() {
    const { data: existingApp, isLoading: isLoadingStatus } =
        useCheckApplicationStatus();
    const { mutateAsync: applyMutation, isPending } = useApplyForSweepstar();
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(null);

    if (isLoadingStatus) return <ContentLoader />;

    const hasPendingApplication = existingApp?.status === "found";
    if (hasPendingApplication || submitSuccess)
        return <SweepstarApplicationStatusModal isPendingOnly={true} />;

    const handleSubmit = async (values) => {
        setSubmitError(null);
        setSubmitSuccess(null);
        try {
            await applyMutation(values);
            setSubmitSuccess(
                "We will review your profile and get back to you shortly.",
            );
        } catch (error) {
            if (error?.response?.status === 409) window.location.reload();
            else
                setSubmitError(
                    error?.response?.data?.message || "Something went wrong.",
                );
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-4 md:p-6 max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-primary/8 to-transparent p-8 md:p-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/80 border mb-6">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Join Our Team</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                    Become a <span className="text-primary">Sweepstar</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                    Join our elite team of professionals. Set your own rates,
                    manage your schedule, and grow your business.
                </p>
            </div>
            <div className="rounded-xl border-border/60 bg-background/50 backdrop-blur-sm shadow-lg">
                <div className="p-6">
                    <BecomeProForm
                        onSubmit={handleSubmit}
                        isSubmitting={isPending}
                        submitError={submitError}
                        submitSuccess={submitSuccess}
                    />
                </div>
            </div>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-4">
                <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>Secure</span>
                </div>
                <div className="w-1 h-1 bg-border rounded-full" />
                <span>Fast Processing</span>
                <div className="w-1 h-1 bg-border rounded-full" />
                <span>No Hidden Fees</span>
            </div>
        </div>
    );
}
