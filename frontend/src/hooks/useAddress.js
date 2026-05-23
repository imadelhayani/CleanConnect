import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ClientApi from "@/Services/ClientApi"; // 1. Import your existing API service

/**
 * Custom Hook: useAddress
 * * This replaces your old AddressContext.
 * It handles fetching, caching, adding, and deleting addresses.
 */
export const useAddress = () => {
    // 2. Access the QueryClient
    // We need this to tell React Query to "refresh" data after we add or delete something.
    const queryClient = useQueryClient();

    // ============================================================
    // PART A: FETCHING DATA (Replaces fetchAddresses + useEffect)
    // ============================================================
    const addressesQuery = useQuery({
        queryKey: ["addresses"], // The unique ID for this data in the cache

        // The function that actually calls the API
        queryFn: async () => {
            const response = await ClientApi.getMyAddresses();

            // Logic from your old context: handle different response structures
            // We return ONLY the data we need (the array of addresses)
            return response.data.addresses || response.data;
        },

        // Optional: Keep data fresh for 5 minutes, but refetch if window gains focus
        staleTime: 1000 * 60 * 5,
    });

    // ============================================================
    // PART B: ADDING DATA (Replaces addAddress)
    // ============================================================
    const addMutation = useMutation({
        // The function that performs the POST request
        mutationFn: async (newAddressData) => {
            return await ClientApi.addAddress(newAddressData);
        },

        // This runs automatically if the API call succeeds
        onSuccess: () => {
            // INVALIDATION: This is the magic.
            // We tell React Query: "The 'addresses' list is old now. Fetch it again!"
            // This replaces the manual `setAddresses([...addresses, savedAddress])`
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

    // ============================================================
    // PART C: DELETING DATA (Replaces deleteAddress)
    // ============================================================
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            return await ClientApi.deleteAddress(id);
        },
        onSuccess: () => {
            // Again, refresh the list automatically after deletion
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
        },
        onError: (error) => {
            console.error("Hook: Delete Failed", error);
        },
    });

    // ============================================================
    // PART D: RETURN VALUES
    // ============================================================
    // We return an object that looks very similar to your old Context
    // so it is easy to use in your components.
    return {
        // Data
        addresses: addressesQuery.data || [], // Default to empty array if data is undefined
        loading: addressesQuery.isLoading, // True while fetching
        error: addressesQuery.isError, // True if fetch failed

        // Actions
        // We use mutateAsync so you can use 'await' in your components if needed
        addAddress: addMutation.mutateAsync,
        updateAddress: updateMutation.mutateAsync,
        deleteAddress: deleteMutation.mutateAsync,

        // Status of actions (Optional, useful for disabling buttons)
        isAdding: addMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
};
