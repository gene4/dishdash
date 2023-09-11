const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function main() {
    try {
        await db.ingredient.createMany({
            data: [
                {
                    name: "Flour",
                    userId: "1",
                    unit: "Cup",
                    price: 2.99,
                    supplier: "Supplier A",
                    category: "Baking",
                },
                {
                    name: "Sugar",
                    userId: "1",
                    unit: "Kg",
                    price: 1.49,
                    supplier: "Supplier B",
                    category: "Baking",
                },
                {
                    name: "Milk",
                    userId: "1",
                    unit: "Liter",
                    price: 0.99,
                    supplier: "Supplier C",
                    category: "Dairy",
                },
                {
                    name: "Eggs",
                    userId: "1",
                    unit: "Dozen",
                    price: 3.49,
                    supplier: "Supplier A",
                    category: "Dairy",
                },
                {
                    name: "Tomatoes",
                    userId: "1",
                    unit: "Kg",
                    price: 2.29,
                    supplier: "Supplier D",
                    category: "Produce",
                },
                {
                    name: "Salt",
                    userId: "1",
                    unit: "Gram",
                    price: 0.25,
                    supplier: "Supplier B",
                    category: "Seasoning",
                },
                {
                    name: "Olive Oil",
                    userId: "1",
                    unit: "Liter",
                    price: 4.99,
                    supplier: "Supplier E",
                    category: "Cooking Oil",
                },
                {
                    name: "Chicken Breast",
                    userId: "1",
                    unit: "Kg",
                    price: 8.99,
                    supplier: "Supplier F",
                    category: "Meat",
                },
                {
                    name: "Onions",
                    userId: "1",
                    unit: "Kg",
                    price: 1.49,
                    supplier: "Supplier D",
                    category: "Produce",
                },
                {
                    name: "Garlic",
                    userId: "1",
                    unit: "Gram",
                    price: 0.1,
                    supplier: "Supplier B",
                    category: "Seasoning",
                },
                {
                    name: "Rice",
                    userId: "1",
                    unit: "Kg",
                    price: 2.79,
                    supplier: "Supplier C",
                    category: "Grains",
                },
                {
                    name: "Salmon",
                    userId: "1",
                    unit: "Filet",
                    price: 12.99,
                    supplier: "Supplier G",
                    category: "Seafood",
                },
                {
                    name: "Bell Peppers",
                    userId: "1",
                    unit: "Kg",
                    price: 2.49,
                    supplier: "Supplier D",
                    category: "Produce",
                },
                {
                    name: "Cheese",
                    userId: "1",
                    unit: "Kg",
                    price: 6.99,
                    supplier: "Supplier H",
                    category: "Dairy",
                },
                {
                    name: "Pasta",
                    userId: "1",
                    unit: "Kg",
                    price: 1.99,
                    supplier: "Supplier C",
                    category: "Grains",
                },
                {
                    name: "Butter",
                    userId: "1",
                    unit: "Gram",
                    price: 0.5,
                    supplier: "Supplier A",
                    category: "Dairy",
                },
                {
                    name: "Beef",
                    userId: "1",
                    unit: "Kg",
                    price: 9.99,
                    supplier: "Supplier F",
                    category: "Meat",
                },
                {
                    name: "Lettuce",
                    userId: "1",
                    unit: "Head",
                    price: 1.29,
                    supplier: "Supplier D",
                    category: "Produce",
                },
                {
                    name: "Lemons",
                    userId: "1",
                    unit: "Kg",
                    price: 3.49,
                    supplier: "Supplier E",
                    category: "Produce",
                },
                {
                    name: "Cucumber",
                    userId: "1",
                    unit: "Kg",
                    price: 1.99,
                    supplier: "Supplier D",
                    category: "Produce",
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
