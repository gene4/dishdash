const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function main() {
    try {
        // Create the "Tomato sauce" recipe
        const tomatoSauceRecipe = await db.recipe.create({
            data: {
                name: "Tomato sauce",
                userId: "user_2VDY5dmkvHBagbod561TixETKhB",
                unit: "Kg",
                yield: 2.5,
            },
        });

        // Create and associate the ingredients with the recipe
        await db.recipeIngredient.createMany({
            data: [
                {
                    amount: 0.5,
                    recipeId: tomatoSauceRecipe.id,
                    ingredientId: "df1b53bc-3177-4956-b696-dce2fd2c2a16",
                },
                {
                    amount: 0.1,
                    recipeId: tomatoSauceRecipe.id,
                    ingredientId: "7758a1e9-6e1a-4d24-9e86-ac32c6a1ba38",
                },
                {
                    amount: 0.2,
                    recipeId: tomatoSauceRecipe.id,
                    ingredientId: "faf72ae7-2a87-47c7-94b5-c06c5da5e59d",
                },
            ],
        });
    } catch (error) {
        console.log("Error in seeding", error);
    } finally {
        db.$disconnect();
    }
}

main();
