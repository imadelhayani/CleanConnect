import { axiosClient } from "@/api/axios";

const PaymentApi = {
    requestPaymentCode: async () => {
        return await axiosClient.post("/api/sweepstar/request-payment-code");
    },
    submitPayment: async (formData) => {
        return await axiosClient.post(
            "/api/sweepstar/submit-payment",
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            },
        );
    },
    getPointTransactions: async (page = 1) => {
        return await axiosClient.get(
            `/api/sweepstar/point-transactions?page=${page}`,
        );
    },
    getPaymentVerifications: async (status = "pending", page = 1) => {
        return await axiosClient.get(
            `/api/admin/payment-verifications?status=${status}&page=${page}`,
        );
    },
    approvePayment: async (id, adminNotes = "") => {
        return await axiosClient.post(
            `/api/admin/payment-verifications/${id}/approve`,
            { admin_notes: adminNotes },
        );
    },
    rejectPayment: async (id, adminNotes) => {
        return await axiosClient.post(
            `/api/admin/payment-verifications/${id}/reject`,
            { admin_notes: adminNotes },
        );
    },
};

export default PaymentApi;
