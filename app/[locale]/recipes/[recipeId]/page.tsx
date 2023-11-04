import { auth, redirectToSignIn } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { DataTable } from "./data-table";
import { calculateRecipePrice } from "@/lib/utils/calculate-recipe-price";
import { formatPrice } from "@/lib/utils/format-price";

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

    // Format data for table
    const recipeIngredients =
        recipe &&
        recipe.ingredients.map((ingredient) => ({
            ...ingredient.ingredient,
            amount: ingredient.amount,
            recipeIngredientId: ingredient.id,
            price: ingredient.ingredient.selectedDeliveryPrice
                ? ingredient.ingredient.selectedDeliveryPrice?.price /
                  ingredient.ingredient.selectedDeliveryPrice?.amount
                : 0,
        }));

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

    return recipeIngredients ? (
        <>
            <div className="flex flex-col mb-10 md:flex-row space-y-6 md:space-y-0 justify-between items-start">
                <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight transition-colors first:mt-0">
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
                                {formatPrice(
                                    calculateRecipePrice(recipe.ingredients)
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <DataTable
                recipeIngredients={recipeIngredients}
                ingredients={ingredients}
                recipe={recipe}
                suppliers={suppliers}
            />
        </>
    ) : (
        <div>Not Found!</div>
    );
}
