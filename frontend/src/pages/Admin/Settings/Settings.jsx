import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSettings, useUpdateSettings } from "@/Hooks/useSettings";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";

const settingsSchema = z.object({
    booking_acceptance_percentage: z.number().min(0).max(100),
    admin_bank_account: z.string().min(1, "Bank account is required"),
    admin_bank_holder: z.string().min(1, "Account holder name is required"),
});

export default function Settings() {
    const { data: settings, isLoading } = useSettings();
    const updateMutation = useUpdateSettings();

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        reset,
    } = useForm({
        resolver: zodResolver(settingsSchema),
        values: {
            booking_acceptance_percentage:
                settings?.booking_acceptance_percentage
                    ? parseFloat(settings.booking_acceptance_percentage)
                    : 10,
            admin_bank_account: settings?.admin_bank_account || "",
            admin_bank_holder: settings?.admin_bank_holder || "",
        },
    });

    const onSubmit = async (data) => {
        try {
            await updateMutation.mutateAsync(data);
            toast.success("Settings updated successfully");
            reset(data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Update failed");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-4 md:p-6 max-w-7xl mx-auto">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-primary/8 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent p-8 md:p-12">
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/15 rounded-full blur-3xl dark:bg-primary/10" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl dark:bg-primary/5" />
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/80 border mb-6">
                        <SettingsIcon className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">
                            Configuration
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        System Settings
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        Configure global settings for the platform.
                    </p>
                </div>
            </div>

            <Card className="rounded-xl border-border/60 bg-background/50 backdrop-blur-sm shadow-lg max-w-2xl mx-auto">
                <CardHeader className="border-b border-border/60 pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <SettingsIcon className="w-5 h-5 text-primary" />
                        Platform Configuration
                    </CardTitle>
                    <CardDescription>
                        Adjust system parameters and payment details
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="booking_acceptance_percentage">
                                Booking Acceptance Percentage (%)
                            </Label>
                            <Input
                                id="booking_acceptance_percentage"
                                type="number"
                                step="0.1"
                                {...register("booking_acceptance_percentage", {
                                    valueAsNumber: true,
                                })}
                            />
                            {errors.booking_acceptance_percentage && (
                                <p className="text-sm text-destructive">
                                    {
                                        errors.booking_acceptance_percentage
                                            .message
                                    }
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Percentage of booking price that sweepstars must
                                have in points to accept a job.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="admin_bank_account">
                                Admin Bank Account Number
                            </Label>
                            <Input
                                id="admin_bank_account"
                                {...register("admin_bank_account")}
                            />
                            {errors.admin_bank_account && (
                                <p className="text-sm text-destructive">
                                    {errors.admin_bank_account.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="admin_bank_holder">
                                Admin Bank Account Holder Name
                            </Label>
                            <Input
                                id="admin_bank_holder"
                                {...register("admin_bank_holder")}
                            />
                            {errors.admin_bank_holder && (
                                <p className="text-sm text-destructive">
                                    {errors.admin_bank_holder.message}
                                </p>
                            )}
                        </div>
                        <Button
                            type="submit"
                            disabled={!isDirty || updateMutation.isPending}
                            className="w-full gap-2"
                        >
                            {updateMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {updateMutation.isPending
                                ? "Saving..."
                                : "Save Changes"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
