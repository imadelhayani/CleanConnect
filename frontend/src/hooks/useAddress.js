import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ClientApi from "@/Services/ClientApi";

export const useAddress = (page = 1) => {
    const queryClient = useQueryClient();

    const addressesQuery = useQuery({
        queryKey: ["addresses", page],
        queryFn: async () => {
            const response = await ClientApi.getMyAddresses(page);
            return response.data; // paginated object
        },
        staleTime: 1000 * 60 * 5,
    });

    const addMutation = useMutation({
        mutationFn: async (newAddressData) => {
            return await ClientApi.addAddress(newAddressData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
        },
        onError: (error) => {
            console.error("Hook: Add Address Failed", error);
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            return await ClientApi.updateAddress(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            return await ClientApi.deleteAddress(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
        },
        onError: (error) => {
            console.error("Hook: Delete Failed", error);
        },
    });

    return {
        // Paginated data
        addresses: addressesQuery.data?.data || [],
        meta: addressesQuery.data
            ? {
                  current_page: addressesQuery.data.current_page,
                  last_page: addressesQuery.data.last_page,
                  per_page: addressesQuery.data.per_page,
                  total: addressesQuery.data.total,
              }
            : null,
        loading: addressesQuery.isLoading,
        error: addressesQuery.isError,

        addAddress: addMutation.mutateAsync,
        updateAddress: updateMutation.mutateAsync,
        deleteAddress: deleteMutation.mutateAsync,

        isAdding: addMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
};
