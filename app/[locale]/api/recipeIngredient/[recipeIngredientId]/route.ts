import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function PATCH(
    req: Request,
    { params }: { params: { recipeIngredientId: string } }
) {
    try {
        const body = await req.json();
        const user = await currentUser();
        const { ingredients } = body;
        if (!params.recipeIngredientId) {
            return new NextResponse("recipeIngredient ID required", {
                status: 400,
            });
        }

        if (!user || !user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!ingredients) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const recipeIngredients = await prismadb.recipeIngredient.update({
            where: {
                id: params.recipeIngredientId,
            },
            data: {
                ingredientId:
                    ingredients[0].type === "ingredient"
                        ? ingredients[0].id
                        : null,
                recipeIngredientId:
                    ingredients[0].type === "recipe" ? ingredients[0].id : null,
                amount: ingredients[0].amount,
            },
        });

        return NextResponse.json(recipeIngredients);
    } catch (error) {
        console.log("[RECIPE_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { recipeIngredientId: string } }
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const recipeIngredient = await prismadb.recipeIngredient.delete({
            where: {
                id: params.recipeIngredientId,
            },
        });

        return NextResponse.json(recipeIngredient);
    } catch (error) {
        console.log("[RECIPE_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
