import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function PATCH(
    req: Request,
    { params }: { params: { recipeId: string } }
) {
    try {
        const body = await req.json();
        const user = await currentUser();
        const { orgId } = auth();

        const { name, unit, recipeYield } = body;
        if (!params.recipeId) {
            return new NextResponse("Recipe ID required", { status: 400 });
        }

        if (!user || !user.id || !orgId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!name || !unit || !recipeYield) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const recipe = await prismadb.recipe.update({
            where: {
                id: params.recipeId,
                orgId,
            },
            data: {
                name,
                unit,
                yield: recipeYield,
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
    { params }: { params: { recipeId: string } }
) {
    try {
        const { userId, orgId } = auth();

        if (!userId || !orgId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Delete all RecipeIngredient records associated with the recipe
        await prismadb.recipeIngredient.deleteMany({
            where: {
                recipeId: params.recipeId,
            },
        });

        // Delete all RecipeIngredient where the recipe is an ingredient
        await prismadb.recipeIngredient.deleteMany({
            where: {
                recipeIngredientId: params.recipeId,
            },
        });

        // Delete all DishIngredient records associated with the recipe
        await prismadb.dishIngredient.deleteMany({
            where: {
                recipeIngredientId: params.recipeId,
            },
        });

        // Delete the recipe itself
        const recipe = await prismadb.recipe.delete({
            where: {
                id: params.recipeId,
                orgId,
            },
        });

        return NextResponse.json(recipe);
    } catch (error) {
        console.log("[RECIPE_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
