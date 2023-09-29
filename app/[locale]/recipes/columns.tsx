"use client";

import { formatDate } from "@/lib/utils/format-date";
import { Recipe } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

import IngredientsActions from "./ingredients-actions";

export const columns: ColumnDef<Recipe>[] = [
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
        accessorKey: "yield",
        header: "YIELD",
    },
    {
        accessorKey: "totalPrice",
        header: ({ column }) => {
            return (
                <Button
                    className="px-0 group hover:bg-transparent"
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }>
                    TOTAL PRICE
                    <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            // @ts-ignore
            const totalPrice = row.original.ingredients.reduce(
                (acc: number, ingredient: any) => {
                    const { amount } = ingredient;
                    const ingredientPrice = ingredient.ingredient?.price || 0;
                    return acc + amount * ingredientPrice;
                },
                0
            );

            const formatted = new Intl.NumberFormat("de-DE", {
                style: "currency",
                currency: "EUR",
            }).format(totalPrice);

            return formatted;
        },
    },
    {
        accessorKey: "pricePer",
        header: ({ column }) => {
            return (
                <Button
                    className="px-0 group hover:bg-transparent"
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
            // @ts-ignore
            const totalPrice = row.original.ingredients.reduce(
                (acc: number, ingredient: any) => {
                    const { amount } = ingredient;
                    const ingredientPrice = ingredient.ingredient?.price || 0;
                    return acc + amount * ingredientPrice;
                },
                0
            );

            const pricePerUnit = row.original.yield / totalPrice;

            const formatted = new Intl.NumberFormat("de-DE", {
                style: "currency",
                currency: "EUR",
            }).format(pricePerUnit);

            return formatted;
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
        // cell: ({ row }) => {
        //     const ingredient = row.original;
        //     return <IngredientsActions ingredient={ingredient} />;
        // },
    },
];
