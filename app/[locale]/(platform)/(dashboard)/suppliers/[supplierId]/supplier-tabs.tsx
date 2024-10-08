"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "./overview";
import { DeliveriesTable } from "./deliveries-table";
import { Delivery, Supplier } from "@prisma/client";
import { Card, Title } from "@tremor/react";
import SupplierActions from "../supplier-actions";
import { useState } from "react";

export default function SupplierTabs({
    deliveries,
    yearsFromDeliveries,
    supplier,
}: {
    deliveries: Delivery[];
    yearsFromDeliveries: string[];
    supplier: Supplier;
}) {
    const [tab, setTab] = useState("overview");

    return (
        <Tabs value={tab}>
            <div className="flex justify-between">
                <TabsList>
                    <TabsTrigger
                        onClick={() => setTab("overview")}
                        value="overview">
                        Overview
                    </TabsTrigger>
                    <TabsTrigger
                        onClick={() => setTab("deliveries")}
                        value="deliveries">
                        Deliveries
                    </TabsTrigger>
                    <TabsTrigger onClick={() => setTab("info")} value="info">
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
