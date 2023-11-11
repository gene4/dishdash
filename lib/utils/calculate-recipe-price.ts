export function calculateNestedItemPrice(ingredients: any) {
    const calculateIngredientPrice = (ingredient: any) => {
        if (ingredient.recipeIngredientId) {
            // If it's a recipe
            const totalRecipePrice =
                ingredient.recipeIngredient.ingredients.reduce(
                    (acc: number, item: any) => {
                        const { amount } = item;
                        const ingredientPrice = calculateIngredientPrice(item);
                        return acc + amount * ingredientPrice;
                    },
                    0
                );
            return totalRecipePrice / ingredient.recipeIngredient.yield;
        } else {
            // If it's an ingredient
            return ingredient.ingredient.selectedDeliveryPrice
                ? ingredient.ingredient.selectedDeliveryPrice.price /
                      ingredient.ingredient.selectedDeliveryPrice.amount
                : 0;
        }
    };

    const totalPrice = ingredients.reduce((acc: number, item: any) => {
        const { amount } = item;
        const ingredientPricePerUnit = calculateIngredientPrice(item);
        return acc + amount * ingredientPricePerUnit;
    }, 0);

    return totalPrice;
}
