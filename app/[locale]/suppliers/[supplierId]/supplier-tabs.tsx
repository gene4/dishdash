"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "./overview";
import { DeliveriesTable } from "./deliveries-table";
import { Delivery, Supplier } from "@prisma/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card, Title } from "@tremor/react";
import SupplierActions from "../supplier-actions";

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
            <div className="flex justify-between">
                <TabsList>
                    <TabsTrigger
                        onClick={() => router.push(pathname + "?tab=overview")}
                        value="overview">
                        Overview
                    </TabsTrigger>
                    <TabsTrigger
                        onClick={() =>
                            router.push(pathname + "?tab=deliveries")
                        }
                        value="deliveries">
                        Deliveries
                    </TabsTrigger>
                    <TabsTrigger
                        onClick={() => router.push(pathname + "?tab=info")}
                        value="info">
                        Information
                    </TabsTrigger>
                </TabsList>
                <SupplierActions supplier={supplier} />
            </div>
            <TabsContent value="overview">
                <Overview
                    deliveries={deliveries}
                    yearsFromInvoices={yearsFromDeliveries.reverse()}
                />
            </TabsContent>
            <TabsContent className="relative h-full" value="deliveries">
                <DeliveriesTable deliveries={deliveries} />
            </TabsContent>
            <TabsContent className="relative h-full" value="info">
                <Card>
                    <Title className="text-2xl mb-5">Information</Title>
                    <p className="text-sm">
                        {supplier.paymentInfo || "No information available"}
                    </p>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
