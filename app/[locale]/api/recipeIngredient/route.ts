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
                    ingredientId: ingredient.id,
                    amount: ingredient.amount,
                    recipeId,
                },
            });
        }

        return NextResponse.json(recipeId);
    } catch (error) {
        console.log("[INGREDIENT_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
