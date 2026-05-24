import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRequestPaymentCode, useSubmitPayment } from "@/Hooks/usePayments";
import { useUser } from "@/Hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Copy, CheckCircle, Wallet, Sparkles } from "lucide-react";
import { toast } from "sonner";

const paymentSchema = z.object({
    code: z.string().min(1, "Code is required"),
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    sender_account_number: z.string().min(1, "Account number is required"),
    sender_account_name: z.string().min(1, "Account holder name is required"),
    screenshot: z
        .instanceof(File)
        .refine((file) => file.size <= 5 * 1024 * 1024, "Max file size 5MB"),
});

export default function TopUpPoints() {
    const { data: user } = useUser();
    const [step, setStep] = useState(1);
    const [codeData, setCodeData] = useState(null);

    const requestCodeMutation = useRequestPaymentCode();
    const submitPaymentMutation = useSubmitPayment();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            code: "",
            amount: "",
            sender_account_number: "",
            sender_account_name: "",
        },
    });

    const handleRequestCode = async () => {
        try {
            const res = await requestCodeMutation.mutateAsync();
            setCodeData(res.data);
            setValue("code", res.data.code);
            setStep(2);
            toast.success("Code generated! Use it as payment motif.");
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to generate code",
            );
        }
    };

    const onSubmit = async (data) => {
        const formData = new FormData();
        formData.append("code", data.code);
        formData.append("amount", data.amount);
        formData.append("sender_account_number", data.sender_account_number);
        formData.append("sender_account_name", data.sender_account_name);
        formData.append("screenshot", data.screenshot);

        try {
            await submitPaymentMutation.mutateAsync(formData);
            toast.success("Payment submitted! Awaiting admin verification.");
            setStep(1);
            setCodeData(null);
        } catch (error) {
            toast.error(error.response?.data?.message || "Submission failed");
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied!");
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
                        <div className="space-y-6">
                            <Alert className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl">
                                <AlertDescription className="text-sm">
                                    Generate a unique payment code. Use this
                                    code as the payment motif when transferring
                                    money to the admin bank account. Once
                                    verified, points will be added to your
                                    balance.
                                </AlertDescription>
                            </Alert>
                            <Button
                                onClick={handleRequestCode}
                                disabled={requestCodeMutation.isPending}
                                className="w-full h-12 rounded-xl font-semibold bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg transition-all"
                            >
                                {requestCodeMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Wallet className="mr-2 h-5 w-5" />
                                        Generate Payment Code
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {step === 2 && codeData && (
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            {/* Admin Bank Details */}
                            <div className="rounded-xl bg-muted/40 p-5 space-y-3 border border-border/60">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <Copy className="w-5 h-5 text-primary" />
                                    Admin Bank Details
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                                        <span className="text-sm text-muted-foreground">
                                            Account Number:
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <code className="bg-muted/80 px-2 py-1 rounded font-mono text-sm">
                                                {codeData.admin_bank_account}
                                            </code>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() =>
                                                    copyToClipboard(
                                                        codeData.admin_bank_account,
                                                    )
                                                }
                                            >
                                                <Copy className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                                        <span className="text-sm text-muted-foreground">
                                            Account Holder:
                                        </span>
                                        <span className="font-medium">
                                            {codeData.admin_bank_holder}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                                        <span className="text-sm text-muted-foreground">
                                            Your Payment Code (Motif):
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <code className="bg-primary/10 px-2 py-1 rounded font-mono text-sm font-bold text-primary">
                                                {codeData.code}
                                            </code>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() =>
                                                    copyToClipboard(
                                                        codeData.code,
                                                    )
                                                }
                                            >
                                                <Copy className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sweepstar's Bank Details */}
                            <div className="space-y-5">
                                <h3 className="font-semibold text-lg">
                                    Your Bank Details
                                </h3>
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="sender_account_number">
                                            Your Account Number
                                        </Label>
                                        <Input
                                            id="sender_account_number"
                                            {...register(
                                                "sender_account_number",
                                            )}
                                            placeholder="e.g., 1234567890"
                                            className="rounded-lg h-11 bg-muted/40"
                                        />
                                        {errors.sender_account_number && (
                                            <p className="text-sm text-destructive">
                                                {
                                                    errors.sender_account_number
                                                        .message
                                                }
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="sender_account_name">
                                            Full Name on Account
                                        </Label>
                                        <Input
                                            id="sender_account_name"
                                            {...register("sender_account_name")}
                                            placeholder="John Doe"
                                            className="rounded-lg h-11 bg-muted/40"
                                        />
                                        {errors.sender_account_name && (
                                            <p className="text-sm text-destructive">
                                                {
                                                    errors.sender_account_name
                                                        .message
                                                }
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="amount">
                                            Amount (in USD)
                                        </Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            {...register("amount", {
                                                valueAsNumber: true,
                                            })}
                                            placeholder="e.g., 100.00"
                                            className="rounded-lg h-11 bg-muted/40"
                                        />
                                        {errors.amount && (
                                            <p className="text-sm text-destructive">
                                                {errors.amount.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="screenshot">
                                            Screenshot of Transfer
                                        </Label>
                                        <Input
                                            id="screenshot"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) =>
                                                setValue(
                                                    "screenshot",
                                                    e.target.files[0],
                                                )
                                            }
                                            className="rounded-lg h-11 bg-muted/40 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                        />
                                        {errors.screenshot && (
                                            <p className="text-sm text-destructive">
                                                {errors.screenshot.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStep(1)}
                                    className="rounded-lg h-11"
                                >
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitPaymentMutation.isPending}
                                    className="flex-1 rounded-lg h-11 bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg font-semibold"
                                >
                                    {submitPaymentMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Submit Payment
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
