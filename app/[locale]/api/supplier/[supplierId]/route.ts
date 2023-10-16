import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function PATCH(
    req: Request,
    { params }: { params: { supplierId: string } }
) {
    try {
        const body = await req.json();
        const user = await currentUser();
        const { name } = body;

        if (!params.supplierId) {
            return new NextResponse("Ingredient ID required", { status: 400 });
        }

        if (!user || !user.id || !user.firstName) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!name) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const supplier = await prismadb.supplier.update({
            where: {
                id: params.supplierId,
                userId: user.id,
            },
            data: {
                name,
            },
        });

        return NextResponse.json(supplier);
    } catch (error) {
        console.log("[SUPPLIER_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { supplierId: string } }
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Delete all invoices records associated with the supplier
        await prismadb.invoice.deleteMany({
            where: {
                supplierId: params.supplierId,
            },
        });

        const supplier = await prismadb.supplier.delete({
            where: {
                userId,
                id: params.supplierId,
            },
        });

        return NextResponse.json(supplier);
    } catch (error) {
        console.log("[Ingredient_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
