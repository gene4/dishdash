"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
    SortingState,
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTablePagination } from "@/components/data-table-pagination";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Plus, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils/format-date";
import { formatPrice } from "@/lib/utils/format-price";
import { DatePickerWithRange } from "@/components/date-picker-range";
import { DateRange } from "react-day-picker";
import { Delivery, DeliveryPrice } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import { calculateDeliveryTotal } from "@/lib/utils/calculate-total-invoices-price";
import { useRouter } from "next/navigation";
import { Card, Title } from "@tremor/react";

export function DeliveriesTable({ deliveries }: { deliveries: any }) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [date, setDate] = useState<DateRange | undefined>();
    const [rowSelection, setRowSelection] = useState({});

    const { push } = useRouter();

    const columns: ColumnDef<Delivery & { items: DeliveryPrice }>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <div className="flex justify-center items-center">
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        onCheckedChange={(value) =>
                            table.toggleAllPageRowsSelected(!!value)
                        }
                        aria-label="Select all"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div
                    onClick={(event) => event.stopPropagation()}
                    className="flex justify-center items-center">
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "invoiceNr",
            header: ({ column }) => {
                return (
                    <Button
                        className="px-0 font-bold group hover:bg-transparent w-max"
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }>
                        INVOICE NUMBER
                        <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => row.getValue("invoiceNr") || "Not available",
        },
        {
            accessorKey: "supplier.name",
            header: ({ column }) => {
                return (
                    <Button
                        className="px-0 font-bold group hover:bg-transparent"
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
            accessorKey: "date",
            header: ({ column }) => {
                return (
                    <Button
                        className="px-0 group font-bold hover:bg-transparent"
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }>
                        DATE
                        <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => formatDate(row.getValue("date")),
        },

        {
            id: "total",
            header: ({ column }) => {
                return (
                    <Button
                        className="px-0 group font-bold hover:bg-transparent w-max"
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
                formatPrice(calculateDeliveryTotal(row.original)),
        },
        {
            id: "actions",
            cell: ({ row }) =>
                row.original.fileUrl && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <a target="_blank" href={row.original.fileUrl}>
                                    <FileText className="h-4 w-4 text-muted-foreground hover:scale-110 transition-all" />
                                </a>
                            </TooltipTrigger>
                            <TooltipContent className="bg-primary text-white rounded-3xl">
                                <p>Open file</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ),
        },
    ];

    const filteredInvoices = useMemo(() => {
        // Filter invoices by date and supplier
        if (!deliveries || !deliveries.length) {
            return [];
        }

        let filtered = deliveries;

        if (date?.from && date.to) {
            filtered = filtered.filter((invoice: Delivery) => {
                const invoiceDate = new Date(invoice.date);
                return invoiceDate > date.from! && invoiceDate < date.to!;
            });
        }

        return filtered;
    }, [deliveries, date]);

    const table = useReactTable({
        data: filteredInvoices,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            rowSelection,
        },
    });

    const selectedRows = table.getFilteredSelectedRowModel().rows;

    const TotalInvoicesPrice = useMemo(() => {
        // return calculateTotalInvoicesPrice(selectedRows);
        if (!selectedRows || selectedRows.length === 0) {
            return 0; // No rows selected, so the total price is 0
        }

        const totalPrice = selectedRows.reduce((total, row) => {
            const price = calculateDeliveryTotal(row.original) || 0;
            return total + price;
        }, 0);

        return totalPrice;
    }, [selectedRows]);

    return (
        <>
            <Card>
                <div className="flex flex-col mb-6 md:flex-row space-y-6 md:space-y-0">
                    <Title>
                        Selected total:{" "}
                        <span className="font-semibold tracking-tight">
                            {formatPrice(TotalInvoicesPrice)}
                        </span>
                    </Title>
                </div>

                <div className="flex flex-col-reverse md:flex-row md:items-center py-4 md:space-x-4">
                    <DatePickerWithRange date={date} setDate={setDate} />
                    <div className="flex justify-between mb-4 space-x-2 md:mb-0 w-full">
                        <Button
                            onClick={() => push("/deliveries/add-delivery")}
                            className="rounded-lg md:ml-auto">
                            Add New <Plus className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <div className="rounded-lg border shadow-sm overflow-scroll">
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
                                                          header.column
                                                              .columnDef.header,
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
                                        className="cursor-pointer"
                                        onClick={() =>
                                            push(
                                                `/deliveries/${row.original.id}`
                                            )
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
            </Card>
        </>
    );
}
