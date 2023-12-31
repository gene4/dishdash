import { currentUser } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/firebase";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
    try {
        const user = await currentUser();
        const data = await req.formData();
        const { orgId } = auth();

        const date = data.get("date")?.toString();
        const supplierId = data.get("supplierId")?.toString();
        const invoiceNr = data.get("invoiceNr")?.toString();
        const credit = data.get("credit")?.toString();

        const ingredients = data.get("ingredients")?.toString();
        const parsedIngredients = ingredients && JSON.parse(ingredients);

        const file: File | null = data.get("file") as unknown as File;

        if (!user || !user.id || !orgId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!supplierId || !date || !ingredients) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        let fileUrl;
        let fileRef;

        if (file) {
            const storageRef = ref(storage, `${user.id}/${file.name}`);
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            await uploadBytes(storageRef, buffer, {
                contentType: file.type,
            }).then(async () => {
                await getDownloadURL(storageRef).then((url) => {
                    fileUrl = url;
                    fileRef = file.name;
                });
            });
        }

        const delivery = await prismadb.delivery.create({
            data: {
                orgId,
                invoiceNr,
                supplierId,
                date: new Date(date),
                fileUrl,
                fileRef,
                credit: credit ? parseFloat(credit.toString()) : 0,
            },
        });
        if (ingredients.length > 0) {
            for (const ingredient of parsedIngredients) {
                const deliveryPrice = await prismadb.deliveryPrice.create({
                    data: {
                        unit: ingredient.unit,
                        amount: ingredient.amount,
                        price: ingredient.price,
                        date: delivery.date,
                        ingredientId: ingredient.id,
                        deliveryId: delivery.id,
                        supplierId: delivery.supplierId,
                    },
                });
                await prismadb.ingredient.update({
                    where: {
                        id: ingredient.id,
                    },
                    data: {
                        selectedDeliveryPriceId: deliveryPrice.id,
                    },
                });
            }
        }

        return NextResponse.json(delivery);
    } catch (error) {
        console.log("[INVOICE_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
