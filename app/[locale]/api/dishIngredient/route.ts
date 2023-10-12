import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const user = await currentUser();
        const { dishId, ingredients } = body;

        if (!user || !user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!dishId || !ingredients) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        for (const ingredient of ingredients) {
            await prismadb.dishIngredient.create({
                data: {
                    ingredientId:
                        ingredient.type === "ingredient" ? ingredient.id : null,
                    recipeId:
                        ingredient.type === "recipe" ? ingredient.id : null,
                    amount: ingredient.amount,
                    dishId: dishId,
                },
            });
        }

        return NextResponse.json(dishId);
    } catch (error) {
        console.log("[INGREDIENT_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
