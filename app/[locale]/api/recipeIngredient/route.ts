import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const user = await currentUser();
        const { recipeId, ingredients } = body;

        if (!user || !user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!recipeId || !ingredients) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        for (const ingredient of ingredients) {
            await prismadb.recipeIngredient.create({
                data: {
                    ingredientId:
                        ingredient.type === "ingredient" ? ingredient.id : null,
                    recipeIngredientId:
                        ingredient.type === "recipe" ? ingredient.id : null,
                    amount: ingredient.amount,
                    recipeId: recipeId,
                    unit: ingredient.unit,
                },
            });
        }

        return NextResponse.json(recipeId);
    } catch (error) {
        console.log("[INGREDIENT_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
