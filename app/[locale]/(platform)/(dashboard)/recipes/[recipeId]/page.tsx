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
import { redirect } from "next/navigation";
import KpiCard from "@/components/kpi-card";
import { NavBreadcrumb } from "@/components/ui/breadcrumb";
import { Divide, Gem, Plus, Scale } from "lucide-react";

interface RecipeIdPageProps {
    params: {
        recipeId: string;
    };
}

export default async function RecipesIdPage({ params }: RecipeIdPageProps) {
    const { userId, orgId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }

    if (!orgId) {
        redirect("/select-org");
    }

    const queryClient = new QueryClient();

    // Get initial recipe
    const recipe = await prismadb.recipe.findUnique({
        where: {
            id: params.recipeId,
            orgId,
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
                <NavBreadcrumb
                    primary={{ label: "Recipes", href: "/recipes" }}
                    secondary={recipe?.name}
                />
                <div className="w-full space-y-4 md:w-fit md:flex md:space-y-0 md:space-x-4">
                    <KpiCard
                        label="Yield"
                        value={`${recipe?.yield} ${recipe?.unit}`}
                        Icon={Scale}
                    />
                    <KpiCard
                        label="Total Price"
                        value={formatPrice(
                            calculateNestedItemPrice(recipe.ingredients)
                        )}
                        Icon={Plus}
                    />
                    <KpiCard
                        label={`Price per ${recipe?.unit.toLowerCase()}`}
                        value={formatPrice(
                            calculateNestedItemPrice(recipe.ingredients) /
                                recipe?.yield
                        )}
                        Icon={Divide}
                    />
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
