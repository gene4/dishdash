import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const user = await currentUser();
        const { orgId } = auth();
        const { name, paymentInfo } = body;

        if (!user || !user.id || !orgId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!name) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const supplier = await prismadb.supplier.create({
            data: {
                orgId,
                name,
                paymentInfo,
            },
        });

        return NextResponse.json(supplier);
    } catch (error) {
        console.log("[SUPPLIER_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
