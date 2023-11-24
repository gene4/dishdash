import { auth, redirectToSignIn } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import {
    HydrationBoundary,
    QueryClient,
    dehydrate,
} from "@tanstack/react-query";
import { getIngredients } from "@/lib/actions";
import { DataTable } from "./data-table";
import { Delivery, DeliveryPrice } from "@prisma/client";
import { formatDate } from "@/lib/utils/format-date";
import { calculateDeliveryTotal } from "@/lib/utils/calculate-total-invoices-price";
import { formatPrice } from "@/lib/utils/format-price";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { FileText } from "lucide-react";

interface DeliveryIdPageProps {
    params: {
        deliveryId: string;
    };
}

export default async function IngredientsPage({ params }: DeliveryIdPageProps) {
    const { userId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }

    const queryClient = new QueryClient();

    const suppliers = await prismadb.supplier.findMany({
        where: {
            userId,
        },
    });

    const delivery = await prismadb.delivery.findUnique({
        where: {
            userId,
            id: params.deliveryId,
        },
        include: {
            supplier: { select: { name: true } },
            items: { include: { ingredient: true } },
        },
    });

    const ingredients = queryClient.prefetchQuery({
        queryKey: ["ingredients"],
        queryFn: getIngredients,
    });

    await Promise.all([delivery, suppliers, ingredients]);

    return (
        <>
            <div className="flex flex-col text-lg md:text-xl mb-10 md:flex-row space-y-6 md:space-y-0 justify-between items-start">
                <div className="font-semibold tracking-tight flex space-x-1">
                    <h1>Delivery Number: </h1>
                    <span className="font-normal flex items-center space-x-1">
                        <span>{delivery?.invoiceNr || "Not available"}</span>
                        {delivery?.fileUrl && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <a
                                            target="_blank"
                                            href={delivery?.fileUrl}>
                                            <FileText className="h-4 w-4 hover:scale-110 transition-all" />
                                        </a>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-primary text-white rounded-3xl">
                                        <p>Open file</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </span>
                </div>
                <div className="flex flex-wrap text-center font-bold space-y-4 md:space-y-0">
                    <div className="flex  w-full md:w-fit space-x-10">
                        <div>
                            <h2 className="border-b mb-1">Supplier</h2>
                            <span className="font-normal">
                                {delivery?.supplier.name}
                            </span>
                        </div>
                        <div>
                            <h2 className="border-b mb-1">Date</h2>
                            {delivery?.date && (
                                <h2 className="font-normal">
                                    {formatDate(delivery?.date)}
                                </h2>
                            )}
                        </div>
                        <div>
                            <h2 className="border-b mb-1">Total</h2>
                            <span className="font-semibold">
                                {formatPrice(
                                    calculateDeliveryTotal(delivery?.items)
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <HydrationBoundary state={dehydrate(queryClient)}>
                <DataTable
                    delivery={delivery as Delivery & { items: DeliveryPrice[] }}
                />
            </HydrationBoundary>
        </>
    );
}
