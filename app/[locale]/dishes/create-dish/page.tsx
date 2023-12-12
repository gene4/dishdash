import { auth, redirectToSignIn } from "@clerk/nextjs";
import { getIngredients, getRecipes, getSuppliers } from "@/lib/actions";
import {
    HydrationBoundary,
    QueryClient,
    dehydrate,
} from "@tanstack/react-query";
import CreateDishForm from "@/components/dishes/create-dish-form";

export default async function CreateDishePage() {
    const { userId } = auth();

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

    await Promise.all([recipes, ingredients, suppliers]);

    return (
        <>
            <h1 className="scroll-m-20 pb-2 text-2xl font-semibold tracking-tight transition-colors first:mt-0 mb-5">
                Create Dish
            </h1>
            <HydrationBoundary state={dehydrate(queryClient)}>
                <CreateDishForm />
            </HydrationBoundary>
        </>
    );
}
