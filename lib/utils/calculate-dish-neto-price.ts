import { DishDataReceived } from "@/app/[locale]/dishes/data-table";

export function calculateNetoDishPrice(dish: DishDataReceived) {
    let netoPrice = 0;

    for (const ingredientOrRecipe of dish.ingredients) {
        if (ingredientOrRecipe.ingredient && ingredientOrRecipe.amount) {
            // If it's a simple ingredient, calculate its cost by multiplying the price with the amount
            netoPrice +=
                ingredientOrRecipe.ingredient.price * ingredientOrRecipe.amount;
        } else if (
            ingredientOrRecipe.recipe &&
            ingredientOrRecipe.recipe.ingredients
        ) {
            // If it's a recipe, calculate the total cost of the recipe and its ingredients
            let recipeCost = 0;

            for (const subIngredient of ingredientOrRecipe.recipe.ingredients) {
                if (subIngredient.ingredient && subIngredient.amount) {
                    // Calculate the cost of each sub-ingredient within the recipe
                    recipeCost +=
                        subIngredient.ingredient.price * subIngredient.amount;
                }
            }

            // Multiply the total cost of the recipe by the amount used in the dish
            netoPrice += recipeCost * ingredientOrRecipe.amount;
        }
    }

    return netoPrice;
}
