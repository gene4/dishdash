import { auth, redirectToSignIn } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { DataTable } from "./data-table";
import NextLink from "next/link";

export default async function IngredientsPage() {
    const { userId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }
    const data = await prismadb.invoice.findMany({
        where: {
            userId,
        },

        include: { supplier: { select: { name: true } } },
    });

    const invoices = data.map((invoice) => ({
        ...invoice,
        supplier: invoice.supplier.name,
    }));

    const suppliers = await prismadb.supplier.findMany({
        where: {
            userId,
        },
    });

    return suppliers.length ? (
        <DataTable data={invoices} suppliers={suppliers} />
    ) : (
        <div className="text-xl">
            Add a{" "}
            <NextLink
                className="underline underline-offset-2"
                href={"/suppliers"}>
                supplier
            </NextLink>{" "}
            first, in order to add invoices.
        </div>
    );
}
