import NotificationApi from "@/Services/NotificationApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useNotifications = (page = 1, perPage = 15) => {
    const queryClient = useQueryClient();

    // Fetch paginated notifications
    const { data, isLoading } = useQuery({
        queryKey: ["notifications", page, perPage],
        queryFn: async () => {
            const { data } = await NotificationApi.getNotifications(
                page,
                perPage,
            );
            return data; // Laravel pagination object
        },
        refetchInterval: 30000,
    });

    const notifications = data?.data || [];
    const meta = data
        ? {
              current_page: data.current_page,
              last_page: data.last_page,
              per_page: data.per_page,
              total: data.total,
          }
        : null;

    const markReadMutation = useMutation({
        mutationFn: NotificationApi.markAsRead,
        onMutate: async (id) => {
            await queryClient.cancelQueries({
                queryKey: ["notifications", page, perPage],
            });
            const previousData = queryClient.getQueryData([
                "notifications",
                page,
                perPage,
            ]);
            queryClient.setQueryData(
                ["notifications", page, perPage],
                (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        data: old.data.map((n) =>
                            n.id === id
                                ? { ...n, read_at: new Date().toISOString() }
                                : n,
                        ),
                    };
                },
            );
            return { previousData };
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const markAllReadMutation = useMutation({
        mutationFn: NotificationApi.markAllAsRead,
        onMutate: async () => {
            await queryClient.cancelQueries({
                queryKey: ["notifications", page, perPage],
            });
            const previousData = queryClient.getQueryData([
                "notifications",
                page,
                perPage,
            ]);
            queryClient.setQueryData(
                ["notifications", page, perPage],
                (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        data: old.data.map((n) => ({
                            ...n,
                            read_at: new Date().toISOString(),
                        })),
                    };
                },
            );
            return { previousData };
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    return {
        notifications,
        meta,
        isLoading,
        unreadCount: notifications.filter((n) => !n.read_at).length,
        markRead: markReadMutation.mutate,
        markAllRead: markAllReadMutation.mutate,
    };
};
