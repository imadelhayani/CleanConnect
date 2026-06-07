import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Content Loader – perfectly centered inside the main panel
 * Use this inside any page component (e.g., AddressManager, Dashboard)
 */
export const ContentLoader = ({ className }) => {
    return (
        <div
            className={cn(
                "w-full flex-1 flex items-center justify-center min-h-[60vh]",
                className,
            )}
        >
            <div className="flex flex-col items-center gap-4">
                <div className="relative h-12 w-12">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/50 animate-spin"></div>
                </div>
                <p className="text-sm font-medium text-muted-foreground animate-pulse">
                    Loading...
                </p>
            </div>
        </div>
    );
};

/**
 * Full‑page overlay loader (use only for initial app load)
 */
export const PageLoader = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
            <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/50 animate-spin"></div>
            </div>
            <p className="text-sm font-medium text-muted-foreground animate-pulse">
                Loading...
            </p>
        </div>
    </div>
);

/**
 * Inline loader for small sections
 */
export const InlineLoader = ({ className }) => (
    <div className={cn("flex justify-center py-8", className)}>
        <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/50 animate-spin"></div>
        </div>
    </div>
);

/**
 * Grid skeleton for cards
 */
export const CardGridSkeleton = ({ count = 6 }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="border rounded-xl p-4 space-y-3">
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-12" />
                </div>
            </div>
        ))}
    </div>
);
