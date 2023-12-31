import { auth, redirectToSignIn } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { DataTable } from "./data-table";
import {
    HydrationBoundary,
    QueryClient,
    dehydrate,
} from "@tanstack/react-query";
import { redirect } from "next/navigation";

import { getDeliveries, getIngredients } from "@/lib/actions";

export default async function IngredientsPage() {
    const { userId, orgId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }

    if (!orgId) {
        redirect("/select-org");
    }

    const queryClient = new QueryClient();

    const suppliers = await prismadb.supplier.findMany({
        where: {
            orgId,
        },
    });
    const ingredients = queryClient.prefetchQuery({
        queryKey: ["ingredients"],
        queryFn: getIngredients,
    });
    const deliveries = queryClient.prefetchQuery({
        queryKey: ["deliveries"],
        queryFn: getDeliveries,
    });

    await Promise.all([deliveries, suppliers, ingredients]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <DataTable suppliers={suppliers} />
        </HydrationBoundary>
    );
}
