import { auth, redirectToSignIn } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { DataTable } from "./data-table";
import { Loader2 } from "lucide-react";

export default async function RecipesPage() {
    const { userId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }
    const dishes = await prismadb.dish.findMany({
        where: {
            userId,
        },
        include: {
            ingredients: {
                include: {
                    ingredient: true,
                    recipe: {
                        include: {
                            ingredients: {
                                include: {
                                    ingredient: {
                                        select: {
                                            price: true,
                                            amount: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    const ingredients = await prismadb.ingredient.findMany({
        where: {
            userId,
        },
    });

    const recipes = await prismadb.recipe.findMany({
        where: {
            userId,
        },
    });

    const suppliers = await prismadb.supplier.findMany({
        where: {
            userId,
        },
    });

    const ingredientsAndRecipes = [...ingredients, ...recipes];

    return (
        <>
            <h1 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0 mb-5">
                Dishes
            </h1>

            <DataTable
                data={dishes}
                ingredientsAndRecipes={ingredientsAndRecipes}
                suppliers={suppliers}
            />
        </>
    );
}
