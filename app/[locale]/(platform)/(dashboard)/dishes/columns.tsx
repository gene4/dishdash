import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import clsx from "clsx";
import { formatPrice } from "@/lib/utils/format-price";
import { Dish, DishIngredient } from "@prisma/client";
import { calculateNestedItemPrice } from "@/lib/utils/calculate-recipe-price";

export const columns: ColumnDef<Dish & { ingredients: DishIngredient[] }>[] = [
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
                    className="px-0 group hover:bg-transparent font-bold w-max"
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }>
                    NETO PRICE
                    <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) =>
            formatPrice(calculateNestedItemPrice(row.original.ingredients)),
    },

    {
        accessorKey: "multiplier",
        header: "MULTIPLIER",
    },
    {
        accessorKey: "menuPrice",
        header: ({ column }) => {
            return (
                <Button
                    className="px-0 group hover:bg-transparent font-bold w-max"
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }>
                    MENU PRICE
                    <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => formatPrice(row.original.menuPrice),
    },
    {
        id: "totalPrice",
        header: () => <div className="w-max">TOTAL PRICE</div>,
        cell: ({ row }) => {
            const netoPrice = calculateNestedItemPrice(
                row.original.ingredients
            );
            const multiplier = row.getValue("multiplier") as number;
            const totalPrice = netoPrice * multiplier;

            const targetPrice = row.getValue("menuPrice") as number;

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
