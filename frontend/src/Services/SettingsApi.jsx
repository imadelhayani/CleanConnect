import { axiosClient } from "@/api/axios";

const SettingsApi = {
    // Get all settings
    getSettings: async () => {
        return await axiosClient.get("/api/admin/settings");
    },

    // Update settings (can send partial)
    updateSettings: async (data) => {
        return await axiosClient.put("/api/admin/settings", data);
    },
};

export default SettingsApi;
