import { ColumnDef } from "@tanstack/react-table";
import { formatPrice } from "@/lib/utils/format-price";
import { formatDate } from "@/lib/utils/format-date";
import { RecipeDataReceived } from "./data-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { calculateRecipePrice } from "@/lib/utils/calculate-recipe-price";

export const columns: ColumnDef<RecipeDataReceived>[] = [
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
        accessorKey: "unit",
        header: "UNIT",
    },
    {
        accessorKey: "yield",
        header: "YIELD",
    },
    {
        accessorKey: "totalPrice",
        header: ({ column }) => {
            return (
                <Button
                    className="px-0 group hover:bg-transparent font-bold w-max"
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }>
                    TOTAL PRICE
                    <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) =>
            formatPrice(calculateRecipePrice(row.original.ingredients)),
    },
    {
        accessorKey: "pricePer",
        header: ({ column }) => {
            return (
                <Button
                    className="px-0 group hover:bg-transparent font-bold w-max"
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }>
                    PRICE PER UNIT
                    <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const totalPrice = calculateRecipePrice(row.original.ingredients);
            const pricePerUnit = totalPrice / row.original.yield;

            return formatPrice(pricePerUnit);
        },
    },
    {
        accessorKey: "updatedAt",
        header: ({ column }) => {
            return (
                <Button
                    className="px-0 group hover:bg-transparent font-bold w-max"
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }>
                    UPDATED AT
                    <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => formatDate(row.getValue("updatedAt")),
    },
];
