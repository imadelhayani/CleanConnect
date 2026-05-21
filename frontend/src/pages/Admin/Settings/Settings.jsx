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
import { Loader2, Save } from "lucide-react";
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
            reset(data); // reset dirty state
        } catch (error) {
            toast.error(error.response?.data?.message || "Update failed");
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container max-w-2xl py-8">
            <Card>
                <CardHeader>
                    <CardTitle>System Settings</CardTitle>
                    <CardDescription>
                        Configure global settings for the platform.
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                        >
                            {updateMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" /> Save
                                    Changes
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
