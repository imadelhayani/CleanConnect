import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminApi from "@/Services/AdminApi";

const fetchUsers = async () => {
    const { data } = await AdminApi.getAllUsers();
    // Handle different API response structures (array vs object)
    return data.users || data;
};

export function useUsers(page = 1) {
    return useQuery({
        queryKey: ["users", page],
        queryFn: async () => {
            const response = await AdminApi.getAllUsers(page);
            return response.data; // includes stats
        },
    });
}
export const useUserDetails = (userId) => {
    return useQuery({
        queryKey: ["user", userId],
        queryFn: async () => {
            const response = await AdminApi.getUserDetails(userId);
            return response.data;
        },
        enabled: !!userId, // Only run if an ID is provided
    });
};
// Add these mutations
export const useAdminUpdateStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }) =>
            await AdminApi.updateUserStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });
};

export const useAdminDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        // Accepts object { id, password }
        mutationFn: async ({ id, password }) =>
            await AdminApi.deleteUser(id, password),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
};
