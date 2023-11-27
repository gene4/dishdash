import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const user = await currentUser();
        const {
            name,
            vat,
            category,
            unit,
            weight,
            amount,
            price,
            bruttoPrice,
            date,
            deliveryId,
            supplierId,
        } = body;

        if (!user || !user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (
            !name ||
            !vat ||
            !category ||
            !unit ||
            !amount ||
            !price ||
            !amount ||
            !supplierId
        ) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const ingredient = await prismadb.ingredient.create({
            data: {
                userId: user.id,
                name,
                vat,
                category,
            },
        });

        const deliveryPrice = await prismadb.deliveryPrice.create({
            data: {
                ingredientId: ingredient.id,
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
                id: ingredient.id,
                userId: user.id,
            },
            data: {
                selectedDeliveryPriceId: deliveryPrice.id,
            },
        });

        return NextResponse.json(ingredient);
    } catch (error) {
        console.log("[INGREDIENT_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}