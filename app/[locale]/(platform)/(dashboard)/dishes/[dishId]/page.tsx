import { auth, redirectToSignIn } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { DataTable } from "./data-table";
import { formatPrice } from "@/lib/utils/format-price";
import clsx from "clsx";
import { nestedRecipeItems } from "@/lib/utils";
import {
    HydrationBoundary,
    QueryClient,
    dehydrate,
} from "@tanstack/react-query";
import { getIngredients, getRecipes } from "@/lib/actions";
import { calculateNestedItemPrice } from "@/lib/utils/calculate-recipe-price";

interface DishIdPageProps {
    params: {
        dishId: string;
    };
}

export default async function RecipesIdPage({ params }: DishIdPageProps) {
    const { userId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }

    const queryClient = new QueryClient();

    // Get initial dish
    const dish = await prismadb.dish.findUnique({
        where: {
            id: params.dishId,
            userId,
        },
        include: nestedRecipeItems,
    });

    const recipes = queryClient.prefetchQuery({
        queryKey: ["recipes"],
        queryFn: getRecipes,
    });

    const ingredients = queryClient.prefetchQuery({
        queryKey: ["ingredients"],
        queryFn: getIngredients,
    });

    await Promise.all([dish, ingredients, recipes]);

    return dish ? (
        <>
            <div className="flex flex-col mb-10 md:flex-row space-y-6 md:space-y-0 justify-between items-start">
                <h1 className="scroll-m-20 border-b md:border-none text-2xl font-semibold tracking-tight transition-colors first:mt-0">
                    Dish: <span className="font-normal">{dish?.name}</span>
                </h1>
                <div className="text-lg md:text:xl flex flex-wrap text-center font-bold space-y-4 md:space-y-0 md:space-x-10">
                    <div className="flex justify-around w-full md:w-fit md:space-x-10">
                        <div>
                            <h2 className="border-b mb-1">Neto Price </h2>
                            <span className="font-normal text-xl md:text-2xl">
                                {formatPrice(
                                    calculateNestedItemPrice(dish.ingredients)
                                )}
                            </span>
                        </div>
                        <div>
                            <h2 className="border-b mb-1">Multiplier </h2>
                            <span className="font-normal text-xl md:text-2xl">
                                {dish.multiplier}
                            </span>
                        </div>
                    </div>
                    <div className="flex justify-around w-full md:w-fit md:space-x-10">
                        <div>
                            <h2 className="border-b mb-1">Menu Price </h2>
                            <span className="font-normal text-xl md:text-2xl">
                                {formatPrice(dish.menuPrice)}
                            </span>
                        </div>

                        <div>
                            <h2 className="border-b mb-1">Total Price </h2>
                            <span
                                className={clsx(
                                    "text-xl md:text-2xl font-semibold",
                                    calculateNestedItemPrice(dish.ingredients) *
                                        dish.multiplier >
                                        dish.menuPrice && "text-red-500"
                                )}>
                                {formatPrice(
                                    calculateNestedItemPrice(dish.ingredients) *
                                        dish.multiplier
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <HydrationBoundary state={dehydrate(queryClient)}>
                <DataTable dish={dish} />
            </HydrationBoundary>
        </>
    ) : (
        <div>Not Found!</div>
    );
}
