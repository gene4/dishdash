import { ColumnDef } from "@tanstack/react-table";
import { DishDataReceived } from "./data-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import clsx from "clsx";
import { calculateNetoDishPrice } from "@/lib/utils/calculate-dish-neto-price";
import { formatPrice } from "@/lib/utils/format-price";

export const columns: ColumnDef<DishDataReceived>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    className="px-0 group hover:bg-transparent font-bold"
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }>
                    NAME
                    <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                </Button>
            );
        },
    },

    {
        accessorKey: "netoPrice",
        header: ({ column }) => {
            return (
                <Button
                    className="px-0 group hover:bg-transparent font-bold"
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }>
                    NETO PRICE
                    <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => formatPrice(calculateNetoDishPrice(row.original)),
    },

    {
        accessorKey: "multiplier",
        header: "MULTIPLIER",
    },
    {
        accessorKey: "targetPrice",
        header: ({ column }) => {
            return (
                <Button
                    className="px-0 group hover:bg-transparent font-bold"
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }>
                    TARGET PRICE
                    <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => formatPrice(row.original.targetPrice),
    },
    {
        header: "TOTAL PRICE",
        cell: ({ row }) => {
            const netoPrice = calculateNetoDishPrice(row.original);
            const multiplier = row.getValue("multiplier") as number;
            const totalPrice = netoPrice * multiplier;

            const targetPrice = row.getValue("targetPrice") as number;

            return (
                <div
                    className={clsx(
                        totalPrice > targetPrice && "text-red-500"
                    )}>
                    {formatPrice(totalPrice)}
                </div>
            );
        },
    },
];
