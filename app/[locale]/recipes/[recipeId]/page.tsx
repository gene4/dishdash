import { auth, redirectToSignIn } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { DataTable } from "./data-table";
import { formatPrice } from "@/lib/utils/format-price";
import { calculateNestedItemPrice } from "@/lib/utils/calculate-recipe-price";
import {
    HydrationBoundary,
    QueryClient,
    dehydrate,
} from "@tanstack/react-query";
import { getIngredients, getSuppliers } from "@/lib/actions";
import { nestedRecipeItems } from "@/lib/utils";

interface RecipeIdPageProps {
    params: {
        recipeId: string;
    };
}

export default async function RecipesIdPage({ params }: RecipeIdPageProps) {
    const { userId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }

    const queryClient = new QueryClient();

    // Get initial recipe
    const recipe = await prismadb.recipe.findUnique({
        where: {
            id: params.recipeId,
            userId,
        },
        include: nestedRecipeItems,
    });

    const ingredients = queryClient.prefetchQuery({
        queryKey: ["ingredients"],
        queryFn: getIngredients,
    });

    const suppliers = queryClient.prefetchQuery({
        queryKey: ["suppliers"],
        queryFn: getSuppliers,
    });

    await Promise.all([recipe, ingredients, suppliers]);

    return recipe ? (
        <>
            <div className="flex flex-col mb-10 md:flex-row space-y-6 md:space-y-0 justify-between items-start">
                <h1 className="scroll-m-20 text-xl font-semibold tracking-tight transition-colors first:mt-0">
                    Recipe: <span className="font-normal">{recipe?.name}</span>
                </h1>
                <div className="text-xl flex flex-wrap text-center font-bold space-y-4 md:space-y-0">
                    <div className="flex justify-around w-full md:w-fit space-x-10">
                        <div>
                            <h2 className="border-b mb-1">Yield</h2>
                            <span className="font-normal text-xl">
                                {recipe?.yield} {recipe?.unit}
                            </span>
                        </div>
                        <div>
                            <h2 className="border-b mb-1">Total Price</h2>
                            <span className="font-normal text-xl">
                                {formatPrice(
                                    calculateNestedItemPrice(recipe.ingredients)
                                )}
                            </span>
                        </div>
                        <div>
                            <h2 className="border-b mb-1">
                                Price per {recipe?.unit.toLowerCase()}
                            </h2>
                            <span className="font-normal text-xl">
                                {formatPrice(
                                    calculateNestedItemPrice(
                                        recipe.ingredients
                                    ) / recipe?.yield
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <HydrationBoundary state={dehydrate(queryClient)}>
                <DataTable recipe={recipe} />
            </HydrationBoundary>
        </>
    ) : (
        <div>Not Found!</div>
    );
}
