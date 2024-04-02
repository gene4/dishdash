import { Column } from "@tanstack/react-table";
import React from "react";
import { Button } from "./ui/button";
import { ArrowUpDown } from "lucide-react";

interface Props<TData, TValue> {
    label: string;
    column: Column<TData, TValue>;
}

export default function SortButton<TData, TValue>({
    label,
    column,
}: Props<TData, TValue>) {
    return (
        <Button
            size={"sm"}
            className="px-0 font-bold group hover:bg-transparent w-max"
            variant="ghost"
            onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
            }>
            {label}
            <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
        </Button>
    );
}
