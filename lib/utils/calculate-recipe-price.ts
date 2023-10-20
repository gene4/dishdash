export function calculateRecipePrice(ingredients: any) {
    const totalPrice = ingredients.reduce((acc: number, ingredient: any) => {
        const { amount } = ingredient;
        const ingredientPrice =
            ingredient.ingredient?.price / ingredient.ingredient?.amount || 0;
        return acc + amount * ingredientPrice;
    }, 0);

    return totalPrice;
}
