const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

// async function main() {
//     try {
//         // Create the "Tomato salad" dish
//         const supplier = await db.supplier.create({
//             data: {
//                 name: "Metro",
//                 userId: "user_2VDY5dmkvHBagbod561TixETKhB",
//             },
//         });

//         // Create and associate the ingredients with the recipe
//         await db.invoice.create({
//             data: {
//                 supplierId: supplier.id,
//                 userId: "user_2VDY5dmkvHBagbod561TixETKhB",
//                 date: "2023-07-16T19:20:30.451Z",
//                 amount: 230,
//                 imageUrl: "https://www.africau.edu/images/default/sample.pdf",
//             },
//         });
//     } catch (error) {
//         console.log("Error in seeding", error);
//     } finally {
//         db.$disconnect();
//     }
// }

// main();

async function seedIngredients() {
    for (let i = 0; i < 100; i++) {
        const ingredientName = `Ingredient ${i + 1}`;
        const ingredientPrice = Math.random() * (50 - 1) + 1; // Random price between 1 and 50

        const ingredient = await db.ingredient.create({
            data: {
                name: ingredientName,
                userId: "user_2VDY5dmkvHBagbod561TixETKhB", // Replace with the actual user ID
                vat: "19%",
                category: "Veggies", // Replace with the category value
            },
        });

        const price = await db.deliveryPrice.create({
            data: {
                unit: "Kg", // Replace with the unit value
                amount: 100, // Replace with the amount value
                price: ingredientPrice,
                date: new Date(), // Replace with the date value
                ingredientId: ingredient.id,
            },
        });

        await db.ingredient.update({
            where: {
                id: ingredient.id,
                // userId: "user_2VDY5dmkvHBagbod561TixETKhB",
            },
            data: {
                selectedDeliveryPriceId: price.id,
            },
        });
    }
}

seedIngredients();
