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
export const useMyBookings = (page = 1) => {
    return useQuery({
        queryKey: ["bookings", "client", page],
        queryFn: async () => {
            const response = await ClientApi.getMyBookings(page);
            return response.data; // now includes stats
        },
    });
};

// 2. Admin: Get "All Bookings"
export const useAllBookings = (page = 1) => {
    return useQuery({
        queryKey: ["bookings", "admin", page],
        queryFn: async () => {
            const response = await AdminApi.getAllBookings(page);
            // response.data now contains { data, stats, ...pagination }
            return response.data;
        },
    });
};
// Fetch single booking by ID (for admin modal)
export const useBookingDetail = (id) => {
    return useQuery({
        queryKey: ["booking", id],
        queryFn: async () => {
            const response = await AdminApi.getBooking(id);
            return response.data;
        },
        enabled: !!id, // only fetch if id is provided
    });
};

// 3. Sweepstar: Get Available Missions
export const useAvailableMissions = (page = 1) => {
    return useQuery({
        queryKey: ["sweepstar", "missions", page],
        queryFn: async () => {
            const response = await SweepstarApi.getAvailableMissions(page);
            return response.data;
        },
    });
};
export const useCurrentMissions = (page = 1) => {
    return useQuery({
        queryKey: ["sweepstar", "missionsHistory", "active", page],
        queryFn: async () => {
            const response = await SweepstarApi.getMissionsHistory(page, true); // pass active=true
            return response.data;
        },
    });
};

// 4. Sweepstar: Get Missions History (Schedule)
export const useMissionsHistory = (page = 1, archived = false) => {
    return useQuery({
        queryKey: ["sweepstar", "missionsHistory", archived, page],
        queryFn: async () => {
            const response = await SweepstarApi.getMissionsHistory(
                page,
                archived,
            );
            return response.data;
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
