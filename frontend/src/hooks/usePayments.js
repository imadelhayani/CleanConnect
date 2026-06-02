import PaymentApi from "@/Services/PaymentApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Sweepstar: Request payment code
export const useRequestPaymentCode = () => {
    return useMutation({
        mutationFn: PaymentApi.requestPaymentCode,
    });
};

// Sweepstar: Submit payment
export const useSubmitPayment = () => {
    return useMutation({
        mutationFn: PaymentApi.submitPayment,
    });
};

// Sweepstar: Get point transactions
export const usePointTransactions = (page = 1) => {
    return useQuery({
        queryKey: ["point-transactions", page],
        queryFn: async () => {
            const response = await PaymentApi.getPointTransactions(page);
            return response.data;
        },
    });
};

// Admin: Get payment verifications (with status filter)
export const usePaymentVerifications = (status = "pending", page = 1) => {
    return useQuery({
        queryKey: ["payment-verifications", status, page],
        queryFn: async () => {
            const response = await PaymentApi.getPaymentVerifications(
                status,
                page,
            );
            return response.data;
        },
    });
};

// Admin: Approve payment
export const useApprovePayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, adminNotes }) =>
            PaymentApi.approvePayment(id, adminNotes),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["payment-verifications"],
            });
        },
    });
};

// Admin: Reject payment
export const useRejectPayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, adminNotes }) =>
            PaymentApi.rejectPayment(id, adminNotes),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["payment-verifications"],
            });
        },
    });
};
