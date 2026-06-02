import { axiosClient } from "@/api/axios";

const SweepstarApi = {
    getAvailableMissions: async (page = 1) => {
        return await axiosClient.get(
            `/api/sweepstar/available-missions?page=${page}`,
        );
    },
    getMissionsHistory: async (page = 1, archived = false) => {
        const url =
            `/api/sweepstar/missions-history?page=${page}` +
            (archived ? "&archived=1" : "");
        return await axiosClient.get(url);
    },
    acceptMission: async (bookingId) => {
        return await axiosClient.post(`/api/bookings/${bookingId}/accept`);
    },
    completeMission: async (bookingId) => {
        return await axiosClient.post(`/api/bookings/${bookingId}/complete`);
    },
    toggleAvailability: async () => {
        return await axiosClient.post("/api/sweepstar/availability");
    },
};

export default SweepstarApi;
