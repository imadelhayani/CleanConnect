import React, { useState } from "react";
import { Sparkles, Shield, Loader2 } from "lucide-react";
import {
    useApplyForSweepstar,
    useCheckApplicationStatus,
} from "@/Hooks/useSweepstar";
import BecomeProForm from "./components/BecomeProForm";
import SweepstarApplicationStatusModal from "./components/SweepstarApplicationStatusModal";

export default function SweepstarApply() {
    const { data: existingApp, isLoading: isLoadingStatus } =
        useCheckApplicationStatus();
    const { mutateAsync: applyMutation, isPending } = useApplyForSweepstar();
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(null);

    const hasPendingApplication = existingApp?.status === "found";

    const handleSubmit = async (values) => {
        setSubmitError(null);
        setSubmitSuccess(null);
        try {
            await applyMutation(values);
            setSubmitSuccess(
                "We will review your profile and get back to you shortly.",
            );
        } catch (error) {
            console.error("Application Error:", error);
            const status = error?.response?.status;
            if (status === 409) {
                window.location.reload();
            } else {
                setSubmitError(
                    error?.response?.data?.message || "Something went wrong.",
                );
            }
        }
    };

    if (isLoadingStatus) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    if (hasPendingApplication || submitSuccess) {
        return <SweepstarApplicationStatusModal isPendingOnly={true} />;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-4 md:p-6 max-w-7xl mx-auto">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-primary/8 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent p-8 md:p-12">
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/15 rounded-full blur-3xl dark:bg-primary/10" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl dark:bg-primary/5" />
                <div className="relative z-10 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/80 border mb-6">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">
                            Join Our Team
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Become a <span className="text-primary">Sweepstar</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        Join our elite team of professionals. Set your own
                        rates, manage your schedule, and grow your business.
                    </p>
                </div>
            </div>

            {/* Form Card */}
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

            {/* Trust Footer */}
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
