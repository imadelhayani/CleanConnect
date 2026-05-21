export const formatDate = (dateString, options = {}) => {
    if (!dateString) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        ...options,
    }).format(new Date(dateString));
};

export const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(Number(amount || 0));

export const formatDuration = (mins) => {
    const m = Number(mins || 0);
    if (!m || m <= 0) return "N/A";
    const h = Math.floor(m / 60);
    const r = m % 60;
    return h <= 0 ? `${r} min` : `${h}h ${r < 10 ? "0" : ""}${r}m`;
};

export const safeArr = (v) => (Array.isArray(v) ? v : []);

export const STATUS_STYLES = {
    completed:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    confirmed:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300",
    pending:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    in_progress:
        "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
};
