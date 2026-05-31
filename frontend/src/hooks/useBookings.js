import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ClientApi from "@/Services/ClientApi";
import AdminApi from "@/Services/AdminApi";
import SweepstarApi from "@/Services/SweepstarApi";

/*
    -------------------------------------------
    PART 1: DATA FETCHING HOOKS (GET Requests)
    -------------------------------------------
*/

// 1. Client: Get "My Bookings"
export const useMyBookings = () => {
    return useQuery({
        queryKey: ["bookings", "client"],
        queryFn: async () => {
            const response = await ClientApi.getMyBookings();
            return response.data.bookings || response.data;
        },
    });
};

// 2. Admin: Get "All Bookings"
export const useAllBookings = () => {
    return useQuery({
        queryKey: ["bookings", "admin"],
        queryFn: async () => {
            const response = await AdminApi.getAllBookings();
            return response.data.bookings || response.data;
        },
    });
};

// 3. Sweepstar: Get Available Missions
export const useAvailableMissions = () => {
    return useQuery({
        queryKey: ["sweepstar", "missions"],
        queryFn: async () => {
            const response = await SweepstarApi.getAvailableMissions();
            return response.data.jobs || [];
        },
    });
};

// 4. Sweepstar: Get Missions History (Schedule)
export const useMissionsHistory = () => {
    return useQuery({
        queryKey: ["sweepstar", "missionsHistory"],
        queryFn: async () => {
            const response = await SweepstarApi.getMissionsHistory();
            return response.data.jobs || [];
        },
    });
};

/*
    -------------------------------------------
    PART 2: ACTION HOOKS (Mutations)
    -------------------------------------------
*/

// 5. Client: Create a Booking
export const useCreateBooking = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (bookingData) => {
            return await ClientApi.createBooking(bookingData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookings", "client"] });
        },
        onError: (error) => {
            console.error("Hook: Create Booking Failed", error);
        },
    });
};

// 6. Shared: Edit/Update a Booking
export const useEditBooking = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            return await ClientApi.updateBooking(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
        },
    });
};

// 7. Client: Cancel a Booking
export const useCancelBooking = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, reason }) => {
            return await ClientApi.cancelBooking(id, reason);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
            // Add this line to refresh user data (and points_balance)
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });
};

// 8. Sweepstar: Accept a Mission
export const useAcceptMission = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (bookingId) => {
            return await SweepstarApi.acceptMission(bookingId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["sweepstar", "missions"],
            });
            queryClient.invalidateQueries({
                queryKey: ["sweepstar", "missionsHistory"],
            });
        },
        onError: (error) => {
            console.error("Hook: Accept Mission Failed", error);
        },
    });
};

// 9. Sweepstar: Complete a Mission
export const useCompleteMission = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (bookingId) => {
            return await SweepstarApi.completeMission(bookingId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["sweepstar", "missionsHistory"],
            });
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
        },
    });
};
