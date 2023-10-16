"use client";

import { formatDate } from "@/lib/utils/format-date";
import { Supplier } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import SupplierActions from "./supplier-actions";

export const columns: ColumnDef<Supplier>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    className="px-0 font-bold group hover:bg-transparent"
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
        accessorKey: "createdAt",
        header: ({ column }) => {
            return (
                <Button
                    className="px-0 group font-bold hover:bg-transparent"
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }>
                    CREATED AT
                    <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => formatDate(row.getValue("createdAt")),
    },
    {
        id: "actions",
        cell: ({ row }) => <SupplierActions row={row} />,
    },
];
