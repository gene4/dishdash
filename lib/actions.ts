"use server";
import { auth, redirectToSignIn } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { Supplier } from "@prisma/client";

export async function getIngredients() {
    const { userId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }

    const ingredients = await prismadb.ingredient.findMany({
        where: {
            userId,
        },
        include: { selectedDeliveryPrice: true, deliveryPrices: true },
    });
    return ingredients;
}

export async function getIngredient(id: string) {
    const { userId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }

    try {
        const ingredient = await prismadb.ingredient.findUnique({
            where: {
                id,
                userId,
            },
            include: { selectedDeliveryPrice: true, deliveryPrices: true },
        });
        return ingredient;
    } catch (error) {
        return { error };
    }
}

export async function getSuppliers(): Promise<Supplier[]> {
    const { userId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }

    const suppliers = await prismadb.supplier.findMany({
        where: {
            userId,
        },
    });
    return suppliers;
}
