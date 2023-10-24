"use client";

import { formatPrice } from "@/lib/utils/format-price";
import { Invoice, Supplier } from "@prisma/client";
import { BarChart, Card, Subtitle, Title } from "@tremor/react";
import { useMemo, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Props {
    invoices: Invoice[];
    yearsFromInvoices: string[];
}

export function Overview({ invoices, yearsFromInvoices }: Props) {
    const [year, setYear] = useState(yearsFromInvoices[0]);
    const InvoicesForChart = useMemo(() => {
        const monthlyTotals: { [month: string]: number } = {
            Jan: 0,
            Feb: 0,
            Mar: 0,
            Apr: 0,
            May: 0,
            Jun: 0,
            Jul: 0,
            Aug: 0,
            Sep: 0,
            Oct: 0,
            Nov: 0,
            Dec: 0,
        };
        // Iterate through the invoices and accumulate the total amounts for each month
        invoices
            .filter((invoice) => invoice.date.getFullYear().toString() === year)
            .forEach((invoice) => {
                const month = invoice.date.toLocaleString("en-US", {
                    month: "short",
                });
                // Add the invoice amount to the corresponding month's total
                monthlyTotals[month] += invoice.amount;
            });

        // Convert the monthlyTotals object to an array of objects for the chart data
        const chartData = Object.keys(monthlyTotals).map((month) => ({
            name: month,
            Total: monthlyTotals[month],
        }));

        return chartData;
    }, [invoices, year]);

    return (
        <Card>
            <div className="flex justify-between items-center">
                {" "}
                <Title>Total invoices sum per month (in EUR)</Title>
                <Select
                    defaultValue={year}
                    onValueChange={(value) => setYear(value)}>
                    <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                        {yearsFromInvoices.map((year) => (
                            <SelectItem value={year} key={year}>
                                {year}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* <Subtitle>
                The IUCN Red List has assessed only a small share of the total
                known species in the world.
            </Subtitle> */}
            <BarChart
                className="mt-6 h-80 w-full"
                data={InvoicesForChart}
                index="name"
                showAnimation
                // showGridLines={false}
                categories={["Total"]}
                colors={["blue"]}
                valueFormatter={(number) => formatPrice(number)}
                yAxisWidth={70}
            />
        </Card>
    );
}