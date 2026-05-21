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
import { Loader2, Copy, CheckCircle } from "lucide-react";
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
    const [step, setStep] = useState(1); // 1: request code, 2: submit payment
    const [codeData, setCodeData] = useState(null);

    const requestCodeMutation = useRequestPaymentCode();
    const submitPaymentMutation = useSubmitPayment();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
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
            console.log("Generated Code Data:", res);
            setCodeData(res.data); // not res.data
            setValue("code", res.data.code);
            // console.log("GData:", codeData);
            // const res = await requestCodeMutation.mutateAsync();
            // setCodeData(res.data);
            // setValue("code", res.data.code);
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
        <div className="container max-w-3xl py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Top Up Points</CardTitle>
                    <CardDescription>
                        Your current balance:{" "}
                        <span className="font-bold text-primary">
                            {user?.sweepstarProfile?.points_balance || 0} points
                        </span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 1 && (
                        <div className="space-y-4">
                            <Alert>
                                <AlertDescription>
                                    Generate a unique payment code. Use this
                                    code as the payment motif when transferring
                                    money to the admin bank account.
                                </AlertDescription>
                            </Alert>
                            <Button
                                onClick={handleRequestCode}
                                disabled={requestCodeMutation.isPending}
                                className="w-full"
                            >
                                {requestCodeMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                                        Generating...
                                    </>
                                ) : (
                                    "Generate Payment Code"
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
                            <div className="rounded-lg bg-muted p-4 space-y-2">
                                <h3 className="font-medium">
                                    Admin Bank Details
                                </h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Account Number:
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <code className="bg-background px-2 py-1 rounded">
                                            {codeData.admin_bank_account}
                                        </code>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() =>
                                                copyToClipboard(
                                                    codeData.admin_bank_account,
                                                )
                                            }
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Account Holder:
                                    </span>
                                    <span className="font-medium">
                                        {codeData.admin_bank_holder}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Your Code (Motif):
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <code className="bg-background px-2 py-1 rounded font-bold">
                                            {codeData.code}
                                        </code>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() =>
                                                copyToClipboard(codeData.code)
                                            }
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Sweepstar's Bank Details */}
                            <div className="space-y-4">
                                <h3 className="font-medium">
                                    Your Bank Details
                                </h3>
                                <div className="grid gap-2">
                                    <Label htmlFor="sender_account_number">
                                        Your Account Number
                                    </Label>
                                    <Input
                                        id="sender_account_number"
                                        {...register("sender_account_number")}
                                        placeholder="e.g., 1234567890"
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
                                    />
                                    {errors.sender_account_name && (
                                        <p className="text-sm text-destructive">
                                            {errors.sender_account_name.message}
                                        </p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="amount">
                                        Amount (in currency)
                                    </Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        {...register("amount", {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="e.g., 100.00"
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
                                    />
                                    {errors.screenshot && (
                                        <p className="text-sm text-destructive">
                                            {errors.screenshot.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStep(1)}
                                >
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitPaymentMutation.isPending}
                                    className="flex-1"
                                >
                                    {submitPaymentMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Payment"
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
