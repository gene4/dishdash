import { auth, redirectToSignIn } from "@clerk/nextjs";
import { DataTable } from "./data-table";
import { getIngredients, getSuppliers } from "@/lib/actions";
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from "@tanstack/react-query";

export default async function IngredientsPage() {
    const { userId } = auth();
    const { orgId } = auth();

    if (!userId || !orgId) {
        return redirectToSignIn();
    }

    const queryClient = new QueryClient();

    // Prefetch data
    const ingredients = queryClient.prefetchQuery({
        queryKey: ["ingredients"],
        queryFn: getIngredients,
    });

    const suppliers = queryClient.prefetchQuery({
        queryKey: ["suppliers"],
        queryFn: getSuppliers,
    });

    await Promise.all([ingredients, suppliers]);

    return (
        <>
            <h1 className="text-2xl font-semibold tracking-tight mb-10">
                Ingredients
            </h1>

            <HydrationBoundary state={dehydrate(queryClient)}>
                <DataTable />
            </HydrationBoundary>
        </>
    );
}
