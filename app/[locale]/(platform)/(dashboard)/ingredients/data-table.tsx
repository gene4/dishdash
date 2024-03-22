"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
    SortingState,
    ColumnFiltersState,
    getFilteredRowModel,
    getSortedRowModel,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table-pagination";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Plus, Search } from "lucide-react";
import { IngredientPriceForm } from "@/components/ingredients/table/ingredient-price-form";
import { DeliveryPrice, Ingredient } from "@prisma/client";
import { formatPrice } from "@/lib/utils/format-price";
import { useQuery } from "@tanstack/react-query";
import { getIngredients } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils/format-date";

export function DataTable() {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const ingredients = useQuery({
        queryKey: ["ingredients"],
        queryFn: getIngredients,
    });

    const { push } = useRouter();
    const columns: ColumnDef<Ingredient>[] = [
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        size={"sm"}
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
            cell: ({ row }) => <div className="w-max">{row.original.name}</div>,
        },

        {
            accessorKey: "vat",
            header: ({ column }) => {
                return (
                    <Button
                        className="px-0 group font-bold hover:bg-transparent"
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }>
                        VAT
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
                        className="px-0 group font-bold hover:bg-transparent"
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }>
                        CATEGORY
                        <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                    </Button>
                );
            },
        },
        {
            accessorKey: "selectedDeliveryPrice",
            header: () => <div className="w-max">SELECTED PRICE</div>,
            cell: ({ row }) => {
                const selectedDeliveryPrice = row.getValue(
                    "selectedDeliveryPrice"
                ) as DeliveryPrice;
                return selectedDeliveryPrice
                    ? `${formatPrice(
                          selectedDeliveryPrice.price /
                              selectedDeliveryPrice.amount
                      )} / ${selectedDeliveryPrice.unit}`
                    : "No price selected";
            },
        },
        {
            accessorKey: "selectedDeliveryPrice.supplier.name",
            header: ({ column }) => (
                <Button
                    size={"sm"}
                    className="px-0 font-bold group hover:bg-transparent"
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }>
                    SUPPLIER
                    <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: "selectedDeliveryPrice.supplier.date",
            header: () => <div className="w-max">LAST UPDATED</div>,
            cell: ({ row }) => {
                const selectedDeliveryPrice = row.getValue(
                    "selectedDeliveryPrice"
                ) as DeliveryPrice;
                return selectedDeliveryPrice
                    ? formatDate(selectedDeliveryPrice.date)
                    : "";
            },
        },
    ];

    const table = useReactTable({
        data: ingredients.data!,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),

        state: {
            sorting,
            columnFilters,
        },
    });

    return (
        <>
            <div className="flex items-center pb-4 justify-between">
                <div className="relative w-48 md:w-60">
                    <Search className="absolute top-0 bottom-0 w-4 h-4 my-auto text-gray-500 left-3" />
                    <Input
                        placeholder="Search ingredients..."
                        value={
                            (table
                                .getColumn("name")
                                ?.getFilterValue() as string) ?? ""
                        }
                        onChange={(event) =>
                            table
                                .getColumn("name")
                                ?.setFilterValue(event.target.value)
                        }
                        className="pl-9 pr-4"
                    />
                </div>
                <Button
                    size={"sm"}
                    onClick={() => {
                        setIsFormOpen(true);
                    }}
                    className="rounded-lg">
                    Add New <Plus className="ml-2 w-4 h-4" />
                </Button>
            </div>
            <div className="rounded-sm border shadow-sm overflow-scroll">
                <Table>
                    <TableHeader className="shadow-sm">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() =>
                                        push(`/ingredients/${row.original.id}`)
                                    }
                                    key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} />
            <IngredientPriceForm
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
            />
        </>
    );
}
