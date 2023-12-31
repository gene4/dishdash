import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const user = await currentUser();
        const { orgId } = auth();
        const { name, unit, recipeYield, ingredients } = body;

        if (!user || !user.id || !orgId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!name || !unit || !recipeYield || !ingredients) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const recipe = await prismadb.recipe.create({
            data: {
                orgId,
                name,
                unit,
                yield: recipeYield,
            },
        });

        for (const ingredient of ingredients) {
            await prismadb.recipeIngredient.create({
                data: {
                    ingredientId:
                        ingredient.type === "ingredient" ? ingredient.id : null,
                    recipeIngredientId:
                        ingredient.type === "recipe" ? ingredient.id : null,
                    amount: ingredient.amount,
                    recipeId: recipe.id,
                    unit: recipe.unit,
                },
            });
        }

        return NextResponse.json(recipe);
    } catch (error) {
        console.log("[INGREDIENT_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
