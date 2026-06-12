import { axiosClient } from "@/api/axios";

const NotificationApi = {
    getNotifications: async (page = 1, perPage = 15) => {
        return await axiosClient.get(
            `/api/notifications?page=${page}&per_page=${perPage}`,
        );
    },
    markAsRead: async (id) => {
        return await axiosClient.post(`/api/notifications/${id}/read`);
    },
    markAllAsRead: async () => {
        return await axiosClient.post("/api/notifications/read-all");
    },
};

export default NotificationApi;
