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

            // If ingredient price isnt selected, return 0
            if (!ingredient.ingredient.selectedDeliveryPrice) return 0;

            if (
                // If ingredient unit is weight but price is Piece
                ingredient.unit === "Kg" &&
                ingredient.ingredient.selectedDeliveryPrice.unit === "Piece"
            ) {
                if (
                    // If weight ingredient isnt selected return 0
                    !ingredient.ingredient.selectedDeliveryPrice
                        .ingredientVariant
                ) {
                    return 0;
                } else {
                    // Convert piece weight to Kg
                    return (
                        ingredient.ingredient.selectedDeliveryPrice.price /
                        ingredient.ingredient.selectedDeliveryPrice
                            .ingredientVariant.wightPerPiece
                    );
                }
            }

            return (
                ingredient.ingredient.selectedDeliveryPrice.price /
                ingredient.ingredient.selectedDeliveryPrice.amount
            );
        }
    };

    const totalPrice = ingredients.reduce((acc: number, item: any) => {
        const { amount } = item;
        const ingredientPricePerUnit = calculateIngredientPrice(item);
        return acc + amount * ingredientPricePerUnit;
    }, 0);

    return totalPrice;
}
