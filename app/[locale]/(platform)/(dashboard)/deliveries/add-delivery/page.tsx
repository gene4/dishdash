import { auth, redirectToSignIn } from "@clerk/nextjs";
import {
    HydrationBoundary,
    QueryClient,
    dehydrate,
} from "@tanstack/react-query";
import { getIngredients, getSuppliers } from "@/lib/actions";
import DeliveryForm from "@/components/delivery/delivery-form";
import { redirect } from "next/navigation";

export default async function IngredientsPage() {
    const { userId, orgId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }

    if (!orgId) {
        redirect("/select-org");
    }

    const queryClient = new QueryClient();

    const suppliers = queryClient.prefetchQuery({
        queryKey: ["suppliers"],
        queryFn: getSuppliers,
    });
    const ingredients = queryClient.prefetchQuery({
        queryKey: ["ingredients"],
        queryFn: getIngredients,
    });

    await Promise.all([suppliers, ingredients]);

    return (
        <>
            <h1 className="scroll-m-20 pb-2 text-2xl font-semibold tracking-tight transition-colors first:mt-0 mb-5">
                Receive Delivery
            </h1>
            <HydrationBoundary state={dehydrate(queryClient)}>
                <DeliveryForm isCredit={false} />
            </HydrationBoundary>
        </>
    );
}
