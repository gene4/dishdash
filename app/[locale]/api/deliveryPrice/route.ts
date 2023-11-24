import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const user = await currentUser();
        const {
            unit,
            weight,
            amount,
            price,
            bruttoPrice,
            date,
            deliveryId,
            supplierId,
            ingredientId,
        } = body;

        if (!user || !user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!unit || !amount || !price || !ingredientId || !supplierId) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const deliveryPrice = await prismadb.deliveryPrice.create({
            data: {
                ingredientId,
                supplierId,
                amount,
                price,
                unit,
                weight,
                bruttoPrice,
                deliveryId,
                date: new Date(date || new Date()),
            },
        });

        await prismadb.ingredient.update({
            where: {
                id: deliveryPrice.ingredientId,
            },
            data: {
                selectedDeliveryPriceId: deliveryPrice.id,
            },
        });

        return NextResponse.json(deliveryPrice);
    } catch (error) {
        console.log("[INGREDIENT_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
