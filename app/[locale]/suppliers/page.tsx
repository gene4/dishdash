import { auth, redirectToSignIn } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { DataTable } from "./data-table";

export default async function IngredientsPage() {
    const { userId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }

    const suppliers = await prismadb.supplier.findMany({
        where: {
            userId,
        },
    });

    return (
        <div>
            <h1 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0 mb-5">
                Suppliers
            </h1>
            <DataTable data={suppliers} />
        </div>
    );
}
