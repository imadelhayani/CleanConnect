import React from "react";
import { useSubmitPayment } from "@/Hooks/usePayments";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import AdminBankDetails from "./AdminBankDetails";
import BankDetailsForm from "./BankDetailsForm";

const paymentSchema = z.object({
    code: z.string().min(1, "Code is required"),
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    sender_account_number: z.string().min(1, "Account number is required"),
    sender_account_name: z.string().min(1, "Account holder name is required"),
    screenshot: z
        .instanceof(File)
        .refine((file) => file.size <= 5 * 1024 * 1024, "Max file size 5MB"),
});

export default function SubmitPaymentForm({ codeData, onSubmitSuccess }) {
    const submitPaymentMutation = useSubmitPayment();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            code: codeData.code,
            amount: "",
            sender_account_number: "",
            sender_account_name: "",
        },
    });

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
            onSubmitSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || "Submission failed");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <AdminBankDetails codeData={codeData} />
            <BankDetailsForm
                register={register}
                errors={errors}
                setValue={setValue}
            />
            <div className="flex gap-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onSubmitSuccess}
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
    );
}
