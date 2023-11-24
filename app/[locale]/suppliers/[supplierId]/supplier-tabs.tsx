"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "./overview";
import { DeliveriesTable } from "./deliveries-table";
import InfoCard from "./info-card";
import { Delivery, Supplier } from "@prisma/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function SupplierTabs({
    deliveries,
    yearsFromDeliveries,
    supplier,
}: {
    deliveries: Delivery[];
    yearsFromDeliveries: string[];
    supplier: Supplier;
}) {
    const tabsParams = useSearchParams();
    const selectedTab = tabsParams.get("tab");

    const router = useRouter();
    const pathname = usePathname();

    return (
        <Tabs value={selectedTab || "overview"} defaultValue="overview">
            <TabsList>
                <TabsTrigger
                    onClick={() => router.push(pathname + "?tab=overview")}
                    value="overview">
                    Overview
                </TabsTrigger>
                <TabsTrigger
                    onClick={() => router.push(pathname + "?tab=deliveries")}
                    value="deliveries">
                    Deliveries
                </TabsTrigger>
                <TabsTrigger
                    onClick={() => router.push(pathname + "?tab=info")}
                    value="info">
                    Information
                </TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
                <Overview
                    deliveries={deliveries}
                    yearsFromInvoices={yearsFromDeliveries.reverse()}
                />
            </TabsContent>
            <TabsContent className="relative h-full" value="deliveries">
                <DeliveriesTable
                    deliveries={deliveries}
                    suppliers={[supplier]}
                />
            </TabsContent>
            <TabsContent className="relative h-full" value="info">
                <InfoCard supplier={supplier} />
            </TabsContent>
        </Tabs>
    );
}
