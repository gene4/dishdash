"use server";
import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { Supplier } from "@prisma/client";
import { nestedRecipeItems } from "./utils";
import { redirect } from "next/navigation";

export async function getIngredients() {
    const { orgId } = auth();

    if (!orgId) {
        redirect("/select-org");
    }

    const ingredients = await prismadb.ingredient.findMany({
        where: {
            orgId,
        },
        include: {
            selectedDeliveryPrice: { include: { supplier: true } },
            deliveryPrices: true,
        },
    });
    return ingredients || [];
}

export async function getSuppliers(): Promise<Supplier[]> {
    const { orgId } = auth();

    if (!orgId) {
        redirect("/select-org");
    }

    const suppliers = await prismadb.supplier.findMany({
        where: {
            orgId,
        },
    });
    return suppliers;
}

export async function getRecipes() {
    const { orgId } = auth();

    if (!orgId) {
        redirect("/select-org");
    }

    const recipes = await prismadb.recipe.findMany({
        where: {
            orgId,
        },
        include: nestedRecipeItems,
    });
    return recipes;
}

export async function getDishes() {
    const { orgId } = auth();

    if (!orgId) {
        redirect("/select-org");
    }

    const recipes = await prismadb.dish.findMany({
        where: {
            orgId,
        },
        include: nestedRecipeItems,
    });
    return recipes;
}

export async function getDeliveries() {
    const { orgId } = auth();

    if (!orgId) {
        redirect("/select-org");
    }

    const deliveries = await prismadb.delivery.findMany({
        where: {
            orgId,
        },
        include: {
            supplier: { select: { name: true } },
            items: { include: { ingredient: true } },
        },
    });

    return deliveries;
}
