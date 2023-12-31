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
        const { orgId } = auth();

        const { selectedDeliveryPriceId } = body;

        if (!params.ingredientId) {
            return new NextResponse("Ingredient ID required", { status: 400 });
        }

        if (!user || !user.id || !orgId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const ingredient = await prismadb.ingredient.update({
            where: {
                id: params.ingredientId,
                orgId,
            },
            data: {
                selectedDeliveryPriceId,
            },
        });

        return NextResponse.json(ingredient);
    } catch (error) {
        console.log("[INGREDIENT_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
