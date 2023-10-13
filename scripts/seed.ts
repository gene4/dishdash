const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function main() {
    try {
        // Create the "Tomato salad" dish
        const supplier = await db.supplier.create({
            data: {
                name: "Metro",
                userId: "user_2VDY5dmkvHBagbod561TixETKhB",
            },
        });

        // Create and associate the ingredients with the recipe
        await db.invoice.create({
            data: {
                supplierId: supplier.id,
                userId: "user_2VDY5dmkvHBagbod561TixETKhB",
                date: "2023-07-16T19:20:30.451Z",
                amount: 230,
                imageUrl: "https://www.africau.edu/images/default/sample.pdf",
            },
        });
    } catch (error) {
        console.log("Error in seeding", error);
    } finally {
        db.$disconnect();
    }
}

main();
