import SettingsApi from "@/Services/SettingsApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useSettings = () => {
    return useQuery({
        queryKey: ["settings"],
        queryFn: async () => {
            const response = await SettingsApi.getSettings();
            return response.data;
        },
    });
};

export const useUpdateSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: SettingsApi.updateSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
        },
    });
};
