import { auth, redirectToSignIn } from "@clerk/nextjs";
import { DataTable } from "./data-table";
import { getSuppliers } from "@/lib/actions";
import { redirect } from "next/navigation";
import {
    HydrationBoundary,
    QueryClient,
    dehydrate,
} from "@tanstack/react-query";

export default async function IngredientsPage() {
    const { userId, orgRole } = auth();

    if (orgRole === "basic_member") {
        redirect("/");
    }

    if (!userId) {
        return redirectToSignIn();
    }

    const queryClient = new QueryClient();

    await queryClient.prefetchQuery({
        queryKey: ["suppliers"],
        queryFn: getSuppliers,
    });

    return (
        <div>
            <h1 className="text-2xl font-semibold tracking-tight mb-10">
                Suppliers
            </h1>
            <HydrationBoundary state={dehydrate(queryClient)}>
                <DataTable />
            </HydrationBoundary>
        </div>
    );
}
