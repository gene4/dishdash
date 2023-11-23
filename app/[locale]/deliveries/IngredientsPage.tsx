import { auth, redirectToSignIn } from "@clerk/nextjs";
import { DataTable } from "./data-table";
import { HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getDeliveries, getSuppliers } from "@/lib/actions";

export default async function IngredientsPage() {
    const { userId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }

    const queryClient = new QueryClient();

    // const deliveries = await prismadb.delivery.findMany({
    //     where: {
    //         userId,
    //     },
    //     include: { supplier: { select: { name: true } } },
    // });
    const deliveries = queryClient.prefetchQuery({
        queryKey: ["suppliers"],
        queryFn: getDeliveries,
    });

    // const invoices = data.map((invoice) => ({
    //     ...invoice,
    //     supplier: invoice.supplier.name,
    // }));
    const suppliers = queryClient.prefetchQuery({
        queryKey: ["suppliers"],
        queryFn: getSuppliers,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <DataTable />{" "}
        </HydrationBoundary>
    );
}
