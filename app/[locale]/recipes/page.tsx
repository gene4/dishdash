import { auth, redirectToSignIn } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { DataTable } from "./data-table";
import { columns } from "./columns";

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
            <h1 className="mt-10 scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0  mb-5">
                Recipes
            </h1>
            <DataTable columns={columns} data={recipes} />
        </div>
    );
}
