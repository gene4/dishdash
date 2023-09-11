import DataTable from "@/components/data-table";
import { title } from "@/components/primitives";
import { auth, redirectToSignIn } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { IngredientT } from "@/types";
import { ingredientsColumns } from "@/config/data";

export default async function IngredientsPage() {
    const { userId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }
    const ingredients = await prismadb.ingredient.findMany({
        where: {
            userId,
        },
    });

    return (
        <div>
            <h1 className={title({ size: "sm" })}>Ingredients</h1>
            <DataTable
                data={ingredients as IngredientT[]}
                columns={ingredientsColumns}
            />
        </div>
    );
}
