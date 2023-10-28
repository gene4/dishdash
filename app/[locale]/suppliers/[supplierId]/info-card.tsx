"use client";

import { getNextPaymentDate } from "@/lib/utils/get-next-payment-date";
import { Supplier } from "@prisma/client";
import { Card } from "@tremor/react";

interface Props {
    supplier: Supplier;
}

export default function InfoCard({ supplier }: Props) {
    return (
        <Card>
            <h1 className="text-2xl mb-5">Information</h1>
            {supplier.paymentDay && (
                <p className="mb-2 text-sm">
                    Next payment date: {getNextPaymentDate(supplier.paymentDay)}
                </p>
            )}
            <p className="text-sm">{supplier.paymentInfo}</p>
        </Card>
    );
}
