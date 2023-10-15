import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import {
    deleteObject,
    getDownloadURL,
    ref,
    uploadBytes,
} from "firebase/storage";
import { storage } from "@/firebase";

import prismadb from "@/lib/prismadb";

export async function PATCH(
    req: Request,
    { params }: { params: { invoiceId: string } }
) {
    try {
        const user = await currentUser();
        const data = await req.formData();

        const invoiceNr = data.get("invoiceNr")?.toString();
        const amount = Number(data.get("amount"));
        const date = data.get("date")?.toString();
        const supplierId = data.get("supplierId")?.toString();

        const file: File | null = data.get("file") as unknown as File;
        let oldFileRef = data.get("fileRef");
        let oldFileUrl = data.get("fileUrl");

        if (!params.invoiceId) {
            return new NextResponse("Invoice ID required", { status: 400 });
        }

        if (!user || !user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!invoiceNr || !supplierId || !date || !amount) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        let newFileUrl;
        let newFileRef;

        // If a new file was sent
        if (file) {
            if (oldFileRef) {
                // First, delete existing file
                const storageRef = ref(
                    storage,
                    `${user.id}/${oldFileRef.toString()}`
                );
                await deleteObject(storageRef)
                    .then(() => {
                        console.log("Old file was deleted!");
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            }

            const storageRef = ref(storage, `${user.id}/${file.name}`);
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            await uploadBytes(storageRef, buffer, {
                contentType: file.type,
            }).then(async () => {
                await getDownloadURL(storageRef).then((url) => {
                    newFileUrl = url;
                    newFileRef = file.name;
                    oldFileUrl = null;
                    oldFileRef = null;
                });
            });
        }

        const invoice = await prismadb.invoice.update({
            where: {
                id: params.invoiceId,
                userId: user.id,
            },
            data: {
                supplierId,
                invoiceNr,
                date: new Date(date),
                amount,
                fileUrl: file ? newFileUrl : oldFileUrl?.toString(),
                fileRef: file ? newFileRef : oldFileRef?.toString(),
            },
        });

        return NextResponse.json(invoice);
    } catch (error) {
        console.log("[INVOICE_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { invoiceId: string } }
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Find Invoice
        const invoice = await prismadb.invoice.findUnique({
            where: {
                id: params.invoiceId,
                userId,
            },
        });

        if (invoice?.fileRef) {
            const storageRef = ref(storage, `${userId}/${invoice?.fileRef}`);
            await deleteObject(storageRef)
                .then(() => {
                    console.log("File was deleted!");
                })
                .catch((error) => {
                    console.log(error);
                });
        }

        await prismadb.invoice.delete({
            where: {
                id: params.invoiceId,
                userId,
            },
        });

        return NextResponse.json(invoice);
    } catch (error) {
        console.log("[INVOICE_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
