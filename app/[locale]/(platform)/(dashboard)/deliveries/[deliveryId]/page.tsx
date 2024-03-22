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
import { calculateDeliverySummary } from "@/lib/utils/calculate-total-invoices-price";
import { formatPrice } from "@/lib/utils/format-price";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { redirect } from "next/navigation";
import { NavBreadcrumb } from "@/components/ui/breadcrumb";
import KpiCard from "@/components/kpi-card";

interface DeliveryIdPageProps {
    params: {
        deliveryId: string;
    };
}

export default async function IngredientsPage({ params }: DeliveryIdPageProps) {
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

    const delivery = await prismadb.delivery.findUnique({
        where: {
            orgId,
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

    const summery = calculateDeliverySummary(
        delivery?.items.map((item) => ({
            vat: item.ingredient.vat,
            price: item.price,
        }))
    );

    return (
        <>
            <div className="flex flex-col mb-10 md:flex-row space-y-6 md:space-y-0 justify-between items-start">
                <div className="flex items-center gap-1">
                    <NavBreadcrumb
                        primary={{
                            label: "Deliveries",
                            href: "/deliveries",
                        }}
                        secondary={delivery?.invoiceNr || "Nr. not available"}
                    />
                    {delivery?.fileUrl && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <a target="_blank" href={delivery?.fileUrl}>
                                        <FileText className="h-4 w-4 hover:scale-110 transition-all" />
                                    </a>
                                </TooltipTrigger>
                                <TooltipContent className="bg-primary text-white rounded-3xl">
                                    <p>Open file</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
                <div className="w-full space-y-4 md:w-fit md:flex md:space-y-0 md:space-x-4">
                    <KpiCard label="Supplier" value={delivery?.supplier.name} />
                    {delivery?.date && (
                        <KpiCard
                            label="Date"
                            value={formatDate(delivery.date)}
                        />
                    )}
                </div>
            </div>

            <HydrationBoundary state={dehydrate(queryClient)}>
                <DataTable
                    delivery={
                        delivery as Delivery & {
                            items: DeliveryPrice[];
                        }
                    }
                />
            </HydrationBoundary>
            <div className="rounded-lg p-4 border bg-card text-card-foreground shadow-sm  mt-10 md:w-[250px] md:ml-auto">
                <div>
                    <div className="flex justify-between">
                        <h2 className="text-muted-foreground text-sm">
                            Netto amount
                        </h2>{" "}
                        <span className="font-semibold">
                            {summery && formatPrice(summery?.nettoSum)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <h2 className="text-muted-foreground text-sm">
                            VAT 7%
                        </h2>{" "}
                        <span className="font-semibold">
                            {summery && formatPrice(summery?.taxAmount7)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <h2 className="text-muted-foreground text-sm">
                            VAT 19%
                        </h2>{" "}
                        <span className="font-semibold">
                            {summery && formatPrice(summery?.taxAmount19)}
                        </span>
                    </div>
                </div>
                <Separator className="my-2" />
                {delivery?.credit != 0 && (
                    <div className="flex justify-between">
                        <h2 className="text-muted-foreground text-sm">
                            Credit
                        </h2>{" "}
                        <span className="font-semibold">
                            -{formatPrice(delivery!.credit)}
                        </span>
                    </div>
                )}
                <div className="flex justify-between">
                    <h2 className="text-muted-foreground text-sm">
                        Total amount
                    </h2>{" "}
                    <span className="font-semibold">
                        {formatPrice(
                            summery?.total -
                                ((delivery!.credit && delivery!.credit) || 0)
                        )}
                    </span>
                </div>
            </div>
        </>
    );
}
