import { auth, redirectToSignIn } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { DataTable, DishIngredients } from "./data-table";
import { formatPrice } from "@/lib/utils/format-price";
import { calculateNetoDishPrice } from "@/lib/utils/calculate-dish-neto-price";
import clsx from "clsx";

interface DishIdPageProps {
    params: {
        dishId: string;
    };
}

export default async function RecipesIdPage({ params }: DishIdPageProps) {
    const { userId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }

    // Get initial dish
    const dish = await prismadb.dish.findUnique({
        where: {
            id: params.dishId,
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

    // Format data for table
    const dishIngredients =
        dish &&
        (dish.ingredients.map((ingredient) => ({
            ...ingredient.ingredient,
            ...ingredient.recipe,
            amount: ingredient.amount,
            price: ingredient.ingredient
                ? ingredient.ingredient.price / ingredient.ingredient.amount
                : null,
            dishIngredientId: ingredient.id,
        })) as DishIngredients[]);

    const ingredients = await prismadb.ingredient.findMany({
        where: {
            userId,
        },
    });
    console.log(dishIngredients);

    const recipes = await prismadb.recipe.findMany({
        where: {
            userId,
        },
    });

    const netoPrice = dish && calculateNetoDishPrice(dish);

    const ingredientsAndRecipes = [...ingredients, ...recipes];

    return dish ? (
        <>
            <div className="flex flex-col mb-10 md:flex-row space-y-6 md:space-y-0 justify-between items-start">
                <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight transition-colors first:mt-0">
                    Dish: <span className="font-normal">{dish?.name}</span>
                </h1>
                <div className="text-xl flex flex-wrap text-center font-bold space-y-4 md:space-y-0 md:space-x-10">
                    <div className="flex justify-around w-full md:w-fit md:space-x-10">
                        <div>
                            <h2 className="border-b mb-1">Neto Price </h2>
                            <span className="font-normal text-2xl">
                                {netoPrice && formatPrice(netoPrice)}
                            </span>
                        </div>
                        <div>
                            <h2 className="border-b mb-1">Multiplier </h2>
                            <span className="font-normal text-2xl">
                                {dish.multiplier}
                            </span>
                        </div>
                    </div>
                    <div className="flex justify-around w-full md:w-fit md:space-x-10">
                        <div>
                            <h2 className="border-b mb-1">Target Price </h2>
                            <span className="font-normal text-2xl">
                                {formatPrice(dish.targetPrice)}
                            </span>
                        </div>

                        <div>
                            <h2 className="border-b mb-1">Total Price </h2>
                            <span
                                className={clsx(
                                    "text-2xl font-semibold",
                                    netoPrice &&
                                        netoPrice * dish.multiplier >
                                            dish.targetPrice &&
                                        "text-red-500"
                                )}>
                                {netoPrice &&
                                    formatPrice(netoPrice * dish.multiplier)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <DataTable
                dish={dish}
                dishIngredients={dishIngredients!}
                ingredientsAndRecipes={ingredientsAndRecipes}
            />
        </>
    ) : (
        <div>Not Found!</div>
    );
}
