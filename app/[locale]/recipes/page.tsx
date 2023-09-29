import { auth, redirectToSignIn } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { title } from "@/components/primitives";
import RecipesTable from "@/components/recipes/recipes-table";
import { recipesColumns } from "@/config/data";

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
                        select: {
                            price: true, // Include the price field from the Ingredient model
                        },
                    },
                },
            },
        },
    });

    return (
        <div>
            <h1 className={title({ size: "sm" })}>Recipes</h1>
            <RecipesTable data={recipes} columns={recipesColumns} />
        </div>
    );
}
