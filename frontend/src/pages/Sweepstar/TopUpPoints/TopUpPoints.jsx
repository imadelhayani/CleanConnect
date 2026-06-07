import React, { useState } from "react";
import { useUser } from "@/Hooks/useAuth";
import { useRequestPaymentCode } from "@/Hooks/usePayments";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Wallet, Sparkles } from "lucide-react";
import { toast } from "sonner";
import GenerateCodeStep from "./components/GenerateCodeStep";
import SubmitPaymentForm from "./components/SubmitPaymentForm";
import { ContentLoader } from "@/components/ui/PageLoader";

export default function TopUpPoints() {
    const { data: user, isLoading } = useUser();
    const [step, setStep] = useState(1);
    const [codeData, setCodeData] = useState(null);
    const requestCodeMutation = useRequestPaymentCode();

    // Show loading skeleton while user data is being fetched
    if (isLoading) return <ContentLoader />;

    const handleRequestCode = async () => {
        try {
            const res = await requestCodeMutation.mutateAsync();
            setCodeData(res.data);
            setStep(2);
            toast.success("Code generated! Use it as payment motif.");
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to generate code",
            );
        }
    };

    const handleReset = () => {
        setStep(1);
        setCodeData(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-4 md:p-6 max-w-7xl mx-auto">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-primary/8 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent p-8 md:p-12">
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/15 rounded-full blur-3xl dark:bg-primary/10" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl dark:bg-primary/5" />
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/80 border mb-6">
                        <Wallet className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">
                            Points System
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Top Up Points
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        Your current balance:{" "}
                        <span className="font-bold text-primary">
                            {user?.points_balance || 0} points
                        </span>
                        <br />
                        Add points to accept more missions and increase your
                        earnings.
                    </p>
                </div>
            </div>

            {/* Main Card */}
            <Card className="rounded-xl border-border/60 bg-background/50 backdrop-blur-sm shadow-lg">
                <CardHeader className="border-b border-border/60 pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Payment Top‑Up
                    </CardTitle>
                    <CardDescription>
                        Generate a payment code, transfer the amount, and upload
                        proof to get points credited.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    {step === 1 && (
                        <GenerateCodeStep
                            onRequestCode={handleRequestCode}
                            isGenerating={requestCodeMutation.isPending}
                        />
                    )}
                    {step === 2 && codeData && (
                        <SubmitPaymentForm
                            codeData={codeData}
                            onSubmitSuccess={handleReset}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
