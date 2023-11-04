import { auth, redirectToSignIn } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { DataTable } from "./data-table";

export default async function RecipesPage() {
    const { userId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }
    const recipes = await prismadb.recipe.findMany({
        where: {
            userId,
        },
        include: {
            ingredients: {
                include: {
                    ingredient: {
                        include: {
                            selectedDeliveryPrice: true,
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

    const suppliers = await prismadb.supplier.findMany({
        where: {
            userId,
        },
    });

    return (
        <>
            <h1 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0 mb-5">
                Recipes
            </h1>
            <DataTable
                data={recipes}
                ingredients={ingredients}
                suppliers={suppliers}
            />
        </>
    );
}
