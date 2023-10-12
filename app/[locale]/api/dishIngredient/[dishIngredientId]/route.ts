import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function PATCH(
    req: Request,
    { params }: { params: { dishIngredientId: string } }
) {
    try {
        const body = await req.json();
        const user = await currentUser();
        const { amount } = body;
        if (!params.dishIngredientId) {
            return new NextResponse("recipeIngredient ID required", {
                status: 400,
            });
        }

        if (!user || !user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!amount) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const dishIngredient = await prismadb.dishIngredient.update({
            where: {
                id: params.dishIngredientId,
            },
            data: {
                amount,
            },
        });

        return NextResponse.json(dishIngredient);
    } catch (error) {
        console.log("[RECIPE_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { dishIngredientId: string } }
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const dishIngredient = await prismadb.dishIngredient.delete({
            where: {
                id: params.dishIngredientId,
            },
        });

        return NextResponse.json(dishIngredient);
    } catch (error) {
        console.log("[RECIPE_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
