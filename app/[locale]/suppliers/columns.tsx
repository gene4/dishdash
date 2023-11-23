"use client";

import { Supplier } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

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
        accessorKey: "paymentInfo",
        header: () => <div className="w-max">PAYMENT INFO</div>,
        cell: ({ row }) => {
            const paymentInfo = row.getValue("paymentInfo") as
                | string
                | undefined;

            return paymentInfo ? (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-muted text-foreground rounded-3xl">
                            {paymentInfo}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ) : (
                "Not specified"
            );
        },
    },
];
