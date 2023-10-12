import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function PATCH(
    req: Request,
    { params }: { params: { dishId: string } }
) {
    try {
        const body = await req.json();
        const user = await currentUser();
        const { name, targetPrice, multiplier } = body;
        if (!params.dishId) {
            return new NextResponse("Recipe ID required", { status: 400 });
        }

        if (!user || !user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!name || !targetPrice || !multiplier) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const recipe = await prismadb.dish.update({
            where: {
                id: params.dishId,
                userId: user.id,
            },
            data: {
                name,
                targetPrice,
                multiplier,
            },
        });

        return NextResponse.json(recipe);
    } catch (error) {
        console.log("[RECIPE_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { dishId: string } }
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Delete all RecipeIngredient records associated with the recipe
        await prismadb.dishIngredient.deleteMany({
            where: {
                dishId: params.dishId,
            },
        });

        // Delete the recipe itself
        const dish = await prismadb.dish.delete({
            where: {
                id: params.dishId,
                userId,
            },
        });

        return NextResponse.json(dish);
    } catch (error) {
        console.log("[RECIPE_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
