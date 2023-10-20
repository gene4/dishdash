import { DishDataReceived } from "@/app/[locale]/dishes/data-table";

export function calculateNetoDishPrice(dish: DishDataReceived) {
    let netoPrice = 0;

    for (const ingredient of dish.ingredients) {
        // If its a recipe
        if (ingredient.recipeId) {
            const totalRecipePrice = ingredient.recipe!.ingredients.reduce(
                (acc: number, ingredient: any) => {
                    const { amount } = ingredient;
                    const ingredientPrice =
                        ingredient.ingredient?.price /
                            ingredient.ingredient?.amount || 0;
                    return acc + amount * ingredientPrice;
                },
                0
            );
            const pricePerUnit = totalRecipePrice / ingredient.recipe!.yield;
            netoPrice += pricePerUnit * ingredient.amount;

            // If its an ingredient
        } else if (ingredient.ingredient) {
            netoPrice +=
                (ingredient.ingredient.price / ingredient.ingredient.amount) *
                ingredient.amount;
        }
    }

    return netoPrice;
}
