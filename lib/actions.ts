"use server";
import { auth, redirectToSignIn } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { Delivery, Supplier } from "@prisma/client";
import { nestedRecipeItems } from "./utils";

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

export async function getRecipes() {
    const { userId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }

    const recipes = await prismadb.recipe.findMany({
        where: {
            userId,
        },
        include: nestedRecipeItems,
    });
    return recipes;
}

export async function getDishes() {
    const { userId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }

    const recipes = await prismadb.dish.findMany({
        where: {
            userId,
        },
        include: nestedRecipeItems,
    });
    return recipes;
}

export async function getDeliveries() {
    const { userId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }

    const deliveries = await prismadb.delivery.findMany({
        where: {
            userId,
        },
        include: {
            supplier: { select: { name: true } },
            items: { include: { ingredient: true } },
        },
    });

    return deliveries;
}
