import { ColumnDef } from "@tanstack/react-table";
import { formatPrice } from "@/lib/utils/format-price";
import { formatDate } from "@/lib/utils/format-date";
import { calculateNestedItemPrice } from "@/lib/utils/calculate-recipe-price";
import { Recipe, RecipeIngredient } from "@prisma/client";
import SortButton from "@/components/sort-button";

export const columns: ColumnDef<
    Recipe & { ingredients: RecipeIngredient[] }
>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return <SortButton column={column} label="NAME" />;
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
            return <SortButton column={column} label="TOTAL PRICE" />;
        },
        cell: ({ row }) =>
            formatPrice(calculateNestedItemPrice(row.original.ingredients)),
    },
    {
        accessorKey: "pricePer",
        header: ({ column }) => {
            return <SortButton column={column} label="PRICE PER UNIT" />;
        },
        cell: ({ row }) => {
            const totalPrice = calculateNestedItemPrice(
                row.original.ingredients
            );
            const pricePerUnit = totalPrice / row.original.yield;

            return formatPrice(pricePerUnit);
        },
    },
    {
        accessorKey: "updatedAt",
        header: ({ column }) => {
            return <SortButton column={column} label="UPDATED AT" />;
        },
        cell: ({ row }) => formatDate(row.getValue("updatedAt")),
    },
];
