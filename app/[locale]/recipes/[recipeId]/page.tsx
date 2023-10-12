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
        <>
            <div className="flex flex-col mb-10 md:flex-row space-y-6 md:space-y-0 justify-between items-start">
                <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                    Recipe: <span className="font-normal">{recipe?.name}</span>
                </h1>
                <div className="text-xl flex flex-wrap text-center font-bold space-y-4 md:space-y-0">
                    <div className="flex justify-around w-full md:w-fit space-x-10">
                        <div>
                            <h2 className="border-b mb-1">Yield</h2>
                            <span className="font-normal text-2xl">
                                {recipe?.yield} {recipe?.unit}
                            </span>
                        </div>
                        <div>
                            <h2 className="border-b mb-1">Total Price</h2>
                            <span className="font-normal text-2xl">
                                {formattedTotalPrice}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <DataTable
                recipeIngredients={recipeIngredients}
                ingredients={ingredients}
                recipe={recipe}
            />
        </>
    ) : (
        <div>Not Found!</div>
    );
}
