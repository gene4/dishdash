import { auth, redirectToSignIn } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { formatPrice } from "@/lib/utils/format-price";
import { DataTable } from "./data-table";
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from "@tanstack/react-query";
import { getSuppliers } from "@/lib/actions";
import { redirect } from "next/navigation";

import KpiCard from "@/components/kpi-card";
import { NavBreadcrumb } from "@/components/ui/breadcrumb";

interface IngredientIdPageProps {
    params: {
        ingredientId: string;
    };
}

export default async function IngredientsIdPage({
    params,
}: IngredientIdPageProps) {
    const { userId, orgId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }

    if (!orgId) {
        redirect("/select-org");
    }

    const queryClient = new QueryClient();

    const ingredient = await prismadb.ingredient.findUnique({
        where: {
            id: params.ingredientId,
            orgId,
        },
        include: {
            selectedDeliveryPrice: true,
            deliveryPrices: {
                include: { supplier: true },
                orderBy: { date: "desc" },
            },
        },
    });

    const suppliers = queryClient.prefetchQuery({
        queryKey: ["suppliers"],
        queryFn: getSuppliers,
    });

    await Promise.all([ingredient, suppliers]);

    const selectedPrice = ingredient?.selectedDeliveryPrice
        ? `${formatPrice(
              ingredient?.selectedDeliveryPrice.price /
                  ingredient?.selectedDeliveryPrice.amount
          )} / ${ingredient?.selectedDeliveryPrice.unit}`
        : "Not selected";

    return ingredient ? (
        <>
            <div className="flex flex-col mb-5 md:mb-10 md:flex-row space-y-6 md:space-y-0 justify-between items-start">
                <NavBreadcrumb
                    primary={{ label: "Ingredients", href: "/ingredients" }}
                    secondary={ingredient?.name}
                />
                <div className="w-full space-y-4 md:w-fit md:flex md:space-y-0 md:space-x-4">
                    <KpiCard label="VAT" value={ingredient.vat} />
                    <KpiCard label="Category" value={ingredient.category} />
                    <KpiCard label="Selected price" value={selectedPrice} />
                </div>
            </div>
            <HydrationBoundary state={dehydrate(queryClient)}>
                <DataTable ingredient={ingredient} />
            </HydrationBoundary>
        </>
    ) : (
        <div>Not Found!</div>
    );
}
