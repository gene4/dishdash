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
    { params }: { params: { deliveryId: string } }
) {
    try {
        const user = await currentUser();
        const data = await req.formData();
        const { orgId } = auth();

        const invoiceNr = data.get("invoiceNr")?.toString();
        const date = data.get("date")?.toString();
        const supplierId = data.get("supplierId")?.toString();
        const credit = data.get("credit");

        const file: File | null = data.get("file") as unknown as File;
        let oldFileRef = data.get("fileRef");
        let oldFileUrl = data.get("fileUrl");

        if (!params.deliveryId) {
            return new NextResponse("Invoice ID required", { status: 400 });
        }

        if (!user || !user.id || !orgId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!supplierId || !date) {
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

        const delivery = await prismadb.delivery.update({
            where: {
                id: params.deliveryId,
                orgId,
            },
            data: {
                supplierId,
                invoiceNr,
                date: new Date(date),
                credit: credit ? parseFloat(credit.toString()) : 0,
                fileUrl: file ? newFileUrl : oldFileUrl?.toString(),
                fileRef: file ? newFileRef : oldFileRef?.toString(),
            },
        });

        return NextResponse.json(delivery);
    } catch (error) {
        console.log("[INVOICE_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { deliveryId: string } }
) {
    try {
        const { userId, orgId } = auth();

        if (!userId || !orgId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Find Invoice
        const invoice = await prismadb.delivery.findUnique({
            where: {
                id: params.deliveryId,
                orgId,
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

        await prismadb.delivery.delete({
            where: {
                id: params.deliveryId,
                orgId,
            },
        });

        return NextResponse.json(invoice);
    } catch (error) {
        console.log("[INVOICE_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
