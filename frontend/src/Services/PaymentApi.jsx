import { axiosClient } from "@/api/axios";

const PaymentApi = {
    // Sweepstar: Request a payment code (also returns admin bank details)
    requestPaymentCode: async () => {
        const response = await axiosClient.post(
            "/api/sweepstar/request-payment-code",
        );
        console.log(response);
        return response;
    },

    // Sweepstar: Submit payment verification
    submitPayment: async (formData) => {
        return await axiosClient.post(
            "/api/sweepstar/submit-payment",
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            },
        );
    },

    // Sweepstar: Get point transactions
    getPointTransactions: async () => {
        return await axiosClient.get("/api/sweepstar/point-transactions");
    },

    // Admin: Get all payment verifications (optional status filter)
    getPaymentVerifications: async (status = "pending") => {
        return await axiosClient.get(
            `/api/admin/payment-verifications?status=${status}`,
        );
    },

    // Admin: Approve a payment
    approvePayment: async (id, adminNotes = "") => {
        return await axiosClient.post(
            `/api/admin/payment-verifications/${id}/approve`,
            {
                admin_notes: adminNotes,
            },
        );
    },

    // Admin: Reject a payment
    rejectPayment: async (id, adminNotes) => {
        return await axiosClient.post(
            `/api/admin/payment-verifications/${id}/reject`,
            {
                admin_notes: adminNotes,
            },
        );
    },
};

export default PaymentApi;
