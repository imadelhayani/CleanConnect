// src/api/ClientApi.js (or wherever this file is located)
import { axiosClient } from "@/api/axios";

const ClientApi = {
    getCsrfToken: async () => {
        // This is the ONLY route that does NOT have /api
        return await axiosClient.get("/sanctum/csrf-cookie");
    },

    login: async (values) => {
        // MATCHES YOUR ROUTE LIST: api/login
        return await axiosClient.post("/api/login", values);
    },

    logout: async () => {
        // MATCHES YOUR ROUTE LIST: api/logout
        return await axiosClient.post("/api/logout");
    },

    register: async (values) => {
        // MATCHES YOUR ROUTE LIST: api/register
        return await axiosClient.post("/api/register", values);
    },

    getClient: async () => {
        // MATCHES YOUR ROUTE LIST: api/user
        return await axiosClient.get("/api/user");
    },

    // --- USER PROFILE MANAGEMENT ---
    // Update user profile (added for your UserInfo component)
    updateProfile: async (id, data) => {
        // Standard RESTful route: PUT /api/users/{id}
        // If your backend uses Fortify, this might be /user/profile-information
        return await axiosClient.put(`/api/users/${id}`, data);
    },
    updateAvatar: async (formData) => {
        return await axiosClient.post("/api/user/avatar", formData, {
            headers: {
                // crucial: override the default 'application/json'
                "Content-Type": "multipart/form-data",
            },
        });
    },
    // Toggle Active/Disabled
    toggleStatus: async () => {
        return await axiosClient.post("/api/user/toggle-status");
    },

    // Delete Own Account
    deleteSelf: async (data) => {
        // data = { password, reason }
        // Note: We use 'data' config in axios for DELETE requests with body
        return await axiosClient.delete("/api/user/delete", { data });
    },

    // --- ADDRESSES ---
    // Get all my addresses
    getMyAddresses: async (page = 1) => {
        return await axiosClient.get(`/api/addresses?page=${page}`);
    },
    // Add a new address
    addAddress: async (data) => {
        return await axiosClient.post("/api/addresses", data);
    },
    // Delete an address
    deleteAddress: async (id) => {
        return await axiosClient.delete(`/api/addresses/${id}`);
    },
    // Update an address
    updateAddress: async (id, data) => {
        return await axiosClient.put(`/api/addresses/${id}`, data);
    },

    // --- BOOKINGS ---
    // Create a new booking
    createBooking: async (data) => {
        return await axiosClient.post("/api/bookings", data);
    },
    // Get my booking history
    getMyBookings: async (page = 1) => {
        return await axiosClient.get(`/api/bookings?page=${page}`);
    },
    // Update an existing booking
    updateBooking: async (id, data) => {
        return await axiosClient.put(`/api/bookings/${id}`, data);
    },
    // Cancel a booking
    cancelBooking: async (id, reason) => {
        return await axiosClient.post(`/api/bookings/${id}/cancel`, { reason });
    },

    // --- SWEEPSTAR APPLICATION ---
    applyToBecomeSweepstar: async (data) => {
        return await axiosClient.post("/api/sweepstar/apply", data);
    },
    checkApplicationStatus: async () => {
        return await axiosClient.get("/api/check-application");
    },
    // --- REVIEWS ---
    submitReview: async (data) => {
        return await axiosClient.post("/api/reviews", data);
    },
    updateReview: async (id, data) => {
        return await axiosClient.put(`/api/reviews/${id}`, data);
    },
    deleteReview: async (id) => {
        return await axiosClient.delete(`/api/reviews/${id}`);
    },
};

export default ClientApi;
