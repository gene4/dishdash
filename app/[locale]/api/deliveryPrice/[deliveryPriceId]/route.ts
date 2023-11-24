import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function PATCH(
    req: Request,
    { params }: { params: { deliveryPriceId: string } }
) {
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
        if (!params.deliveryPriceId) {
            return new NextResponse("deliveryPriceId ID required", {
                status: 400,
            });
        }

        if (!user || !user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!unit || !price || !amount || !ingredientId || !supplierId) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const deliveryPrice = await prismadb.deliveryPrice.update({
            where: {
                id: params.deliveryPriceId,
            },
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

        return NextResponse.json(deliveryPrice);
    } catch (error) {
        console.log("[DELIVERY PRICE_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { deliveryPriceId: string } }
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const deliveryPrice = await prismadb.deliveryPrice.findUnique({
            where: {
                id: params.deliveryPriceId,
            },
        });

        const ingredient = await prismadb.ingredient.findUnique({
            where: {
                id: deliveryPrice?.ingredientId,
            },
        });

        if (deliveryPrice?.id === ingredient?.selectedDeliveryPriceId) {
            await prismadb.ingredient.update({
                where: {
                    id: ingredient?.id,
                },
                data: {
                    selectedDeliveryPriceId: null,
                },
            });
        }

        await prismadb.deliveryPrice.delete({
            where: {
                id: params.deliveryPriceId,
            },
        });

        return NextResponse.json(deliveryPrice);
    } catch (error) {
        console.log("[RECIPE_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
