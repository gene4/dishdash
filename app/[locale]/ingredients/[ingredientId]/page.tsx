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

interface IngredientIdPageProps {
    params: {
        ingredientId: string;
    };
}

export default async function IngredientsIdPage({
    params,
}: IngredientIdPageProps) {
    const { userId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }

    const queryClient = new QueryClient();

    const ingredient = await prismadb.ingredient.findUnique({
        where: {
            id: params.ingredientId,
            userId,
        },
        include: {
            selectedDeliveryPrice: true,
            variants: true,
            deliveryPrices: {
                include: { supplier: true, ingredientVariant: true },
                orderBy: { date: "desc" },
            },
        },
    });

    const suppliers = queryClient.prefetchQuery({
        queryKey: ["suppliers"],
        queryFn: getSuppliers,
    });

    await Promise.all([ingredient, suppliers]);

    return ingredient ? (
        <>
            <div className="flex flex-col mb-5 md:mb-10 md:flex-row space-y-6 md:space-y-0 justify-between items-start">
                <h1 className="scroll-m-20 text-xl md:text-2xl font-semibold tracking-tight transition-colors first:mt-0">
                    Ingredient:{" "}
                    <span className="font-normal">{ingredient?.name}</span>
                </h1>
                <div className="text-base md:text-xl flex flex-wrap text-center font-bold space-y-4 md:space-y-0">
                    <div className="flex justify-around w-full md:w-fit space-x-10">
                        <div>
                            <h2 className="border-b mb-1">VAT</h2>
                            <span className="font-normal">
                                {ingredient.vat}
                            </span>
                        </div>
                        <div>
                            <h2 className="border-b mb-1">Category</h2>
                            <span className="font-normal">
                                {ingredient.category}
                            </span>
                        </div>
                        <div>
                            <h2 className="border-b mb-1">Selected price</h2>
                            <span className="font-normal">
                                {ingredient.selectedDeliveryPrice
                                    ? `${formatPrice(
                                          ingredient.selectedDeliveryPrice
                                              .price /
                                              ingredient.selectedDeliveryPrice
                                                  .amount
                                      )} / ${
                                          ingredient.selectedDeliveryPrice.unit
                                      }`
                                    : "Not selected"}
                            </span>
                        </div>
                    </div>
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
