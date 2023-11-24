import { Loader2 } from "lucide-react";

export default function Loading() {
    // You can add any UI inside Loading, including a Skeleton.
    return (
        <h1 className="flex items-center scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
            Deliveries
            <Loader2 className="ml-2 animate-spin" />
        </h1>
    );
}
