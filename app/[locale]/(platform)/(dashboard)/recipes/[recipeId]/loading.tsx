import { Loader2 } from "lucide-react";

export default function Loading() {
    // You can add any UI inside Loading, including a Skeleton.
    return (
        <h1 className="flex items-center text-2xl font-semibold tracking-tight mb-10">
            Recipe <Loader2 className="ml-2 animate-spin" />
        </h1>
    );
}
