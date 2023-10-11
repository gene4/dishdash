import { auth, redirectToSignIn } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { DataTable } from "./data-table";

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

    // Get initial recipe
    const recipe = await prismadb.recipe.findUnique({
        where: {
            id: params.recipeId,
            userId,
        },
        include: {
            ingredients: { include: { ingredient: true } },
        },
    });

    // Format data for table
    const recipeIngredients =
        recipe &&
        recipe.ingredients.map((ingredient) => ({
            ...ingredient.ingredient,
            amount: ingredient.amount,
            recipeIngredientId: ingredient.id,
        }));

    const ingredients = await prismadb.ingredient.findMany({
        where: {
            userId,
        },
    });
    console.log("recipeIngredients", recipeIngredients);

    // Calculate and format recipe's total price
    const totalPrice =
        recipeIngredients &&
        recipeIngredients.reduce((acc: number, ingredient: any) => {
            const ingredientPrice = ingredient.price || 0;
            return acc + ingredient.amount * ingredientPrice;
        }, 0);

    const formattedTotalPrice =
        totalPrice &&
        new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "EUR",
        }).format(totalPrice);

    return recipeIngredients ? (
        <div>
            <div className="mb-5">
                <h1 className="scroll-m-20 text-4xl font-semibold tracking-tight transition-colors first:mt-0">
                    Recipe: <span className="font-normal">{recipe?.name}</span>
                </h1>
                <div className="text-xl mt-5">
                    <h2 className="font-extrabold">
                        Yield:{" "}
                        <span className="font-normal">
                            {recipe?.yield} {recipe?.unit}
                        </span>
                    </h2>
                    <h2 className="font-extrabold">
                        Total Price:{" "}
                        <span className="font-normal">
                            {formattedTotalPrice}
                        </span>
                    </h2>
                </div>
            </div>
            <DataTable
                recipeIngredients={recipeIngredients}
                ingredients={ingredients}
                recipe={recipe}
            />
        </div>
    ) : (
        <div>Not Found!</div>
    );
}
