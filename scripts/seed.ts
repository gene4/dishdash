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
    const ingredient = await db.ingredient.create({
        data: {
            name: "Cauliflower",
            userId: "user_2VDY5dmkvHBagbod561TixETKhB", // Replace with the actual user ID
            vat: "19%",
            category: "Veggies", // Replace with the category value
            variants: {
                big: {
                    wightPerPiece: 0.6,
                },
                small: {
                    wightPerPiece: 0.3,
                },
            },
        },
    });

    const price = await db.deliveryPrice.create({
        data: {
            unit: "Piece", // Replace with the unit value
            amount: 12, // Replace with the amount value
            price: 24,
            date: new Date(), // Replace with the date value
            ingredientId: ingredient.id,
            variant: "big",
        },
    });

    await db.ingredient.update({
        where: {
            id: ingredient.id,
        },
        data: {
            selectedDeliveryPriceId: price.id,
        },
    });
}

seedIngredients();
