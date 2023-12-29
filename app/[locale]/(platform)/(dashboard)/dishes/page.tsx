import { auth, redirectToSignIn } from "@clerk/nextjs";
import { DataTable } from "./data-table";
import {
    HydrationBoundary,
    QueryClient,
    dehydrate,
} from "@tanstack/react-query";
import {
    getDishes,
    getIngredients,
    getRecipes,
    getSuppliers,
} from "@/lib/actions";
import { redirect } from "next/navigation";

export default async function RecipesPage() {
    const { userId, orgRole } = auth();

    if (orgRole === "basic_member") {
        redirect("/");
    }

    if (!userId) {
        return redirectToSignIn();
    }

    const queryClient = new QueryClient();

    // Prefetch data
    const recipes = queryClient.prefetchQuery({
        queryKey: ["recipes"],
        queryFn: getRecipes,
    });

    const ingredients = queryClient.prefetchQuery({
        queryKey: ["ingredients"],
        queryFn: getIngredients,
    });

    const suppliers = queryClient.prefetchQuery({
        queryKey: ["suppliers"],
        queryFn: getSuppliers,
    });

    const dishes = queryClient.prefetchQuery({
        queryKey: ["dishes"],
        queryFn: getDishes,
    });

    await Promise.all([dishes, recipes, ingredients, suppliers]);

    return (
        <>
            <h1 className="scroll-m-20 pb-2 text-2xl font-semibold tracking-tight transition-colors first:mt-0 mb-5">
                Dishes
            </h1>
            <HydrationBoundary state={dehydrate(queryClient)}>
                <DataTable />
            </HydrationBoundary>
        </>
    );
}
