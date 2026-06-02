import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ClientApi from "@/Services/ClientApi";
import AdminApi from "@/Services/AdminApi";
import SweepstarApi from "@/Services/SweepstarApi";

/*
    -------------------------------------------
    PART 1: ADMIN HOOKS (Managing Applications)
    -------------------------------------------
*/

// 1. Fetch all pending applications
// Hooks/useApplications.js (or wherever it lives)
export const usePendingApplications = (page = 1) => {
    return useQuery({
        queryKey: ["admin", "applications", page],
        queryFn: async () => {
            const response = await AdminApi.getPendingApplications(page);
            return response.data; // includes stats
        },
    });
};

// 2. Approve an application
export const useApproveApplication = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            return await AdminApi.approveSweepstar(id);
        },
        onSuccess: () => {
            // AUTOMATIC UI UPDATE:
            // When we approve someone, they are no longer "pending".
            // We tell React Query to refresh the list, so the item disappears from the UI.
            queryClient.invalidateQueries({
                queryKey: ["admin", "applications"],
            });
        },
        onError: (error) => {
            console.error("Failed to approve application", error);
        },
    });
};

// 3. Reject an application
export const useRejectApplication = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            return await AdminApi.rejectSweepstar(id);
        },
        onSuccess: () => {
            // Refresh list to remove the rejected item
            queryClient.invalidateQueries({
                queryKey: ["admin", "applications"],
            });
        },
        onError: (error) => {
            console.error("Failed to reject application", error);
        },
    });
};

/*
    -------------------------------------------
    PART 2: CLIENT HOOKS (Applying)
    -------------------------------------------
*/

// 4. Client applies to become a Sweepstar
export const useApplyForSweepstar = () => {
    return useMutation({
        mutationFn: async (applicationData) => {
            return await ClientApi.applyToBecomeSweepstar(applicationData);
        },
        // We don't necessarily need to invalidate queries here,
        // unless you have a "My Application Status" list on the client dashboard.
        onError: (error) => {
            // You can access error.response.data.message in the component
            console.error("Application failed", error);
        },
    });
};

export const useCheckApplicationStatus = () => {
    return useQuery({
        queryKey: ["sweepstar", "application-status"],
        queryFn: async () => {
            const response = await ClientApi.checkApplicationStatus();
            return response.data;
        },
        retry: false, // Don't retry if it fails (unless it's a network error)
    });
};

export const useToggleAvailability = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            return await SweepstarApi.toggleAvailability();
        },
        onSuccess: (response) => {
            // We need to update the Dashboard data immediately so the switch doesn't flip back
            queryClient.invalidateQueries({
                queryKey: ["dashboard", "sweepstar"],
            });
        },
        onError: (error) => {
            console.error("Failed to toggle availability", error);
        },
    });
};
