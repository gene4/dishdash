import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const user = await currentUser();
        const { orgId } = auth();
        const { name, menuPrice, multiplier, ingredients, vat } = body;

        if (!user || !user.id || !orgId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!name || !menuPrice || !multiplier || !ingredients) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const dish = await prismadb.dish.create({
            data: {
                orgId,
                name,
                menuPrice,
                multiplier,
                vat,
            },
        });

        for (const ingredient of ingredients) {
            await prismadb.dishIngredient.create({
                data: {
                    ingredientId:
                        ingredient.type === "ingredient" ? ingredient.id : null,
                    recipeIngredientId:
                        ingredient.type === "recipe" ? ingredient.id : null,
                    amount: ingredient.amount,
                    dishId: dish.id,
                    unit: ingredient.unit,
                },
            });
        }

        return NextResponse.json(dish);
    } catch (error) {
        console.log("[INGREDIENT_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
