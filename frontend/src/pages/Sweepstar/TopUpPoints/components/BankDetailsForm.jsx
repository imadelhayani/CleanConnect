import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BankDetailsForm({ register, errors, setValue }) {
    return (
        <div className="space-y-5">
            <h3 className="font-semibold text-lg">Your Bank Details</h3>
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="sender_account_number">
                        Your Account Number
                    </Label>
                    <Input
                        id="sender_account_number"
                        {...register("sender_account_number")}
                        placeholder="e.g., 1234567890"
                        className="rounded-lg h-11 bg-muted/40"
                    />
                    {errors.sender_account_number && (
                        <p className="text-sm text-destructive">
                            {errors.sender_account_number.message}
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
                            {errors.sender_account_name.message}
                        </p>
                    )}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="amount">Amount (in USD)</Label>
                    <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        {...register("amount", { valueAsNumber: true })}
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
                    <Label htmlFor="screenshot">Screenshot of Transfer</Label>
                    <Input
                        id="screenshot"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                            setValue("screenshot", e.target.files[0])
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
    );
}
