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
import { redirect } from "next/navigation";
import { NavBreadcrumb } from "@/components/ui/breadcrumb";
import KpiCard from "@/components/kpi-card";
import { Gem, Plus, ScrollText, XIcon } from "lucide-react";

interface DishIdPageProps {
    params: {
        dishId: string;
    };
}

export default async function RecipesIdPage({ params }: DishIdPageProps) {
    const { userId, orgId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }

    if (!orgId) {
        redirect("/select-org");
    }

    const queryClient = new QueryClient();

    // Get initial dish
    const dish = await prismadb.dish.findUnique({
        where: {
            id: params.dishId,
            orgId,
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
                <NavBreadcrumb
                    primary={{ label: "Dishes", href: "/dishes" }}
                    secondary={dish?.name}
                />
                <div className="w-full space-y-4 md:w-fit md:flex md:space-y-0 md:space-x-4">
                    <KpiCard
                        label="Net price"
                        value={formatPrice(
                            calculateNestedItemPrice(dish.ingredients)
                        )}
                        Icon={Plus}
                    />
                    <KpiCard
                        label="Multiplier"
                        value={`${dish.multiplier}`}
                        Icon={XIcon}
                    />
                    <KpiCard
                        label="Menu price"
                        value={formatPrice(dish.menuPrice)}
                        Icon={ScrollText}
                    />
                    <KpiCard
                        label="Total price"
                        value={
                            <p
                                className={clsx(
                                    calculateNestedItemPrice(dish.ingredients) *
                                        dish.multiplier >
                                        dish.menuPrice && "text-red-500"
                                )}>
                                {formatPrice(
                                    calculateNestedItemPrice(dish.ingredients) *
                                        dish.multiplier
                                )}
                            </p>
                        }
                        Icon={Gem}
                    />
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
