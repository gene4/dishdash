import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const user = await currentUser();
        const { name, targetPrice, multiplier, ingredients } = body;

        if (!user || !user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!name || !targetPrice || !multiplier || !ingredients) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const dish = await prismadb.dish.create({
            data: {
                userId: user.id,
                name,
                targetPrice,
                multiplier,
            },
        });

        for (const ingredient of ingredients) {
            await prismadb.dishIngredient.create({
                data: {
                    ingredientId:
                        ingredient.type === "ingredient" ? ingredient.id : null,
                    recipeId:
                        ingredient.type === "recipe" ? ingredient.id : null,
                    amount: ingredient.amount,
                    dishId: dish.id,
                },
            });
        }

        return NextResponse.json(dish);
    } catch (error) {
        console.log("[INGREDIENT_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
