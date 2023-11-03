import { auth, redirectToSignIn } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { DataTable } from "./data-table";

export default async function IngredientsPage() {
    const { userId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }
    const ingredients = prismadb.ingredient.findMany({
        where: {
            userId,
        },
        include: { selectedDeliveryPrice: true, deliveryPrices: true },
    });

    const suppliers = prismadb.supplier.findMany({
        where: {
            userId,
        },
    });

    const data = await Promise.all([ingredients, suppliers]);

    return (
        <>
            <h1 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0 mb-5">
                Ingredients
            </h1>
            <DataTable suppliers={data[1]} data={data[0]} />
        </>
    );
}
