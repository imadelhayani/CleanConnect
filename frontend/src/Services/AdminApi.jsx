import { axiosClient } from "@/api/axios";

const AdminApi = {
    getAllUsers: async (page = 1) => {
        return await axiosClient.get(`/api/admin/users?page=${page}`);
    },
    getUserDetails: async (id) => {
        return await axiosClient.get(`/api/admin/users/${id}`);
    },
    getAllBookings: async (page = 1) => {
        return await axiosClient.get(`/api/bookings?page=${page}`);
    },
    getBooking: async (id) => {
        return await axiosClient.get(`/api/bookings/${id}`);
    },

    updateBookingStatus: async (id, status) => {
        return await axiosClient.put(`/api/admin/bookings/${id}/status`, {
            status,
        });
    },
    deleteBooking: async (id) => {
        return await axiosClient.delete(`/api/bookings/${id}`);
    },
    getPendingApplications: async (page = 1) => {
        return await axiosClient.get(`/api/admin/applications?page=${page}`);
    },
    approveSweepstar: async (id) => {
        return await axiosClient.post(`/api/admin/applications/${id}/approve`);
    },
    rejectSweepstar: async (id) => {
        return await axiosClient.delete(`/api/admin/applications/${id}/reject`);
    },
    updateUserStatus: async (id, status) => {
        return await axiosClient.put(`/api/admin/users/${id}/status`, {
            status,
        });
    },
    deleteUser: async (id, password) => {
        return await axiosClient.delete(`/api/admin/users/${id}`, {
            data: { password },
        });
    },
};

export default AdminApi;
