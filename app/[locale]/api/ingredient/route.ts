import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const user = await currentUser();
        const { name, unit, price, supplier, category } = body;
        console.log("price in backend", price);

        if (!user || !user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!name || !unit || !price || !supplier || !category) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const ingredient = await prismadb.ingredient.create({
            data: {
                userId: user.id,
                name,
                unit,
                price,
                supplier,
                category,
            },
        });

        return NextResponse.json(ingredient);
    } catch (error) {
        console.log("[INGREDIENT_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
