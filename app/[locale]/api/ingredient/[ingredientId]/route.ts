import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { IngredientVariant } from "@prisma/client";

export async function PATCH(
    req: Request,
    { params }: { params: { ingredientId: string } }
) {
    try {
        const body = await req.json();
        const user = await currentUser();
        const { name, vat, category, selectedDeliveryPriceId, variants } = body;

        if (!params.ingredientId) {
            return new NextResponse("Ingredient ID required", { status: 400 });
        }

        if (!user || !user.id || !user.firstName) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!name || !vat || !category) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const ingredient = await prismadb.ingredient.update({
            where: {
                id: params.ingredientId,
                userId: user.id,
            },
            data: {
                name,
                vat,
                category,
                selectedDeliveryPriceId,
            },
            include: { variants: true },
        });

        if (variants.length > 0) {
            for (const variant of variants) {
                // if variant exists then update
                if (variant.id) {
                    await prismadb.ingredientVariant.update({
                        where: {
                            id: variant.id,
                        },
                        data: {
                            name: variant.name,
                            wightPerPiece: variant.wightPerPiece,
                        },
                    });
                    // if variant doesn't exists then create
                } else {
                    await prismadb.ingredientVariant.create({
                        data: {
                            name: variant.name,
                            wightPerPiece: variant.wightPerPiece,
                            parentIngredientId: params.ingredientId,
                        },
                    });
                }
            }
        }

        // search for deleted variants and delete them
        if (ingredient.variants.length > 0) {
            const variantsToDelete = ingredient.variants.filter(
                (oldVariant: IngredientVariant) =>
                    !variants.some(
                        (newVariant: IngredientVariant) =>
                            newVariant.id === oldVariant.id
                    )
            );

            if (variantsToDelete.length > 0) {
                for (const variant of variantsToDelete) {
                    await prismadb.ingredientVariant.delete({
                        where: {
                            id: variant.id,
                        },
                    });
                }
            }
        }
        return NextResponse.json(ingredient);
    } catch (error) {
        console.log("[INGREDIENT_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { ingredientId: string } }
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const ingredient = await prismadb.ingredient.findUnique({
            where: {
                id: params.ingredientId,
            },

            include: { variants: true, recipes: true, dishes: true },
        });

        console.log("ingredient", ingredient);

        // Delete all variants of ingredient
        if (ingredient!.variants.length > 0) {
            await prismadb.ingredientVariant.deleteMany({
                where: {
                    parentIngredientId: params.ingredientId,
                },
            });
        }

        // Delete all RecipeIngredient records associated with the ingredient
        if (ingredient!.recipes.length > 0) {
            await prismadb.recipeIngredient.deleteMany({
                where: {
                    ingredientId: params.ingredientId,
                },
            });
        }

        // Delete all DishIngredient records associated with the ingredient
        if (ingredient!.dishes.length > 0) {
            await prismadb.dishIngredient.deleteMany({
                where: {
                    ingredientId: params.ingredientId,
                },
            });
        }
        await prismadb.ingredient.update({
            where: {
                id: params.ingredientId,
            },
            data: {
                selectedDeliveryPriceId: null,
            },
        });

        // Delete all DeliveryPrice records associated with the ingredient
        await prismadb.deliveryPrice.deleteMany({
            where: {
                ingredientId: params.ingredientId,
            },
        });

        await prismadb.ingredient.delete({
            where: {
                userId,
                id: params.ingredientId,
            },
        });

        return NextResponse.json(ingredient);
    } catch (error) {
        console.log("[Ingredient_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
