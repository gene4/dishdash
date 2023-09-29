"use client";

import { formatDate } from "@/lib/utils/format-date";
import { Ingredient } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

import IngredientsActions from "./ingredients-actions";

export const columns: ColumnDef<Ingredient>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    className="px-0 group hover:bg-transparent"
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
        accessorKey: "price",
        header: ({ column }) => {
            return (
                <Button
                    className="px-0 group hover:bg-transparent"
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }>
                    PRICE
                    <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("price"));
            const formatted = new Intl.NumberFormat("de-DE", {
                style: "currency",
                currency: "EUR",
            }).format(price);

            return formatted;
        },
    },
    {
        accessorKey: "supplier",
        header: ({ column }) => {
            return (
                <Button
                    className="px-0 group hover:bg-transparent"
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }>
                    SUPPLIER
                    <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: "category",
        header: ({ column }) => {
            return (
                <Button
                    className="px-0 group hover:bg-transparent"
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }>
                    SUPPLIER
                    <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: "updatedAt",
        header: ({ column }) => {
            return (
                <Button
                    className="px-0 group hover:bg-transparent"
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
    {
        id: "actions",
        cell: ({ row }) => {
            const ingredient = row.original;
            return <IngredientsActions ingredient={ingredient} />;
        },
    },
];
