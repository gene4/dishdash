const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function main() {
    try {
        // Create the "Tomato salad" dish
        const tomatoSaladDish = await db.dish.create({
            data: {
                name: "Tomato Salad",
                userId: "user_2VDY5dmkvHBagbod561TixETKhB",
                multiplier: 3,
                targetPrice: 12,
            },
        });

        // Create and associate the ingredients with the recipe
        await db.dishIngredient.createMany({
            data: [
                {
                    amount: 0.1,
                    dishId: tomatoSaladDish.id,
                    recipeId: "0efa967e-d86b-4ad7-99ca-cfb00f11bec6",
                },
                {
                    amount: 0.2,
                    dishId: tomatoSaladDish.id,
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
