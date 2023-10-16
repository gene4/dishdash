import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/firebase";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
    try {
        const user = await currentUser();

        const data = await req.formData();
        const amount = Number(data.get("amount"));
        const date = data.get("date")?.toString();
        const status = data.get("status")?.toString();
        const supplierId = data.get("supplierId")?.toString();
        const invoiceNr = data.get("invoiceNr")?.toString();

        const file: File | null = data.get("file") as unknown as File;

        if (!user || !user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!invoiceNr || !supplierId || !date || !amount || !status) {
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

        const invoice = await prismadb.invoice.create({
            data: {
                userId: user.id,
                invoiceNr,
                supplierId,
                date: new Date(date),
                status,
                amount,
                fileUrl,
                fileRef,
            },
        });

        return NextResponse.json(invoice);
    } catch (error) {
        console.log("[INVOICE_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
