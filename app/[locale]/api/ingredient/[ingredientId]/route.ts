import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function PATCH(
    req: Request,
    { params }: { params: { ingredientId: string } }
) {
    try {
        const body = await req.json();
        const user = await currentUser();
        const { name, vat, category, selectedDeliveryPriceId } = body;

        if (!params.ingredientId) {
            return new NextResponse("Ingredient ID required", { status: 400 });
        }

        if (!user || !user.id || !user.firstName) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!name || !vat || !category) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const ingredient = await prismadb.ingredient.update({
            where: {
                id: params.ingredientId,
                userId: user.id,
            },
            data: {
                name,
                vat,
                category,
                selectedDeliveryPriceId,
            },
        });

        return NextResponse.json(ingredient);
    } catch (error) {
        console.log("[INGREDIENT_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { ingredientId: string } }
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Delete all RecipeIngredient records associated with the ingredient
        await prismadb.recipeIngredient.deleteMany({
            where: {
                ingredientId: params.ingredientId,
            },
        });

        // Delete all DishIngredient records associated with the ingredient
        await prismadb.dishIngredient.deleteMany({
            where: {
                ingredientId: params.ingredientId,
            },
        });

        // Delete all DeliveryPrice records associated with the ingredient
        await prismadb.deliveryPrice.deleteMany({
            where: {
                ingredientId: params.ingredientId,
            },
        });

        const ingredient = await prismadb.ingredient.delete({
            where: {
                userId,
                id: params.ingredientId,
            },
        });

        return NextResponse.json(ingredient);
    } catch (error) {
        console.log("[Ingredient_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
