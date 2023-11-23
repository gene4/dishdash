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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DataTablePagination } from "@/components/data-table-pagination";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils/format-date";
import { formatPrice } from "@/lib/utils/format-price";
import { DatePickerWithRange } from "@/components/date-picker-range";
import { DateRange } from "react-day-picker";
import { Invoice, Supplier } from "@prisma/client";
import InvoiceForm from "@/components/delivery/delivery-form";
import InvoiceActions from "./invoice-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { calculateTotalInvoicesPrice } from "@/lib/utils/calculate-total-invoices-price";
import { Card, Title } from "@tremor/react";
import { statuses } from "../../deliveries/data-table";

interface DataTableProps {
    data: Invoice[];
    supplier: Supplier;
}

export function DataTable({ data, supplier }: DataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [date, setDate] = useState<DateRange | undefined>();
    const [status, setStatus] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [rowSelection, setRowSelection] = useState({});

    const columns: ColumnDef<Invoice>[] = [
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
                <div className="flex justify-center items-center">
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
                        className="px-0 font-bold group hover:bg-transparent"
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }>
                        INVOICE NUMBER
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
            accessorKey: "amount",
            header: ({ column }) => {
                return (
                    <Button
                        className="px-0 group font-bold hover:bg-transparent"
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }>
                        AMOUNT
                        <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => formatPrice(row.original.amount),
        },
        {
            accessorKey: "status",
            header: ({ column }) => {
                return (
                    <Button
                        className="px-0 group font-bold hover:bg-transparent"
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }>
                        STATUS
                        <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const status = statuses.find(
                    (status) => status.value === row.getValue("status")
                );

                if (!status) {
                    return null;
                }

                return (
                    <div className="flex w-[100px] items-center">
                        {status.label}
                    </div>
                );
            },
        },

        {
            id: "actions",
            cell: ({ row }) => (
                <InvoiceActions supplier={supplier} invoice={row.original} />
            ),
        },
    ];

    const filteredInvoices = useMemo(() => {
        // Filter invoices by date and supplier
        if (!data || !data.length) {
            return [];
        }

        let filtered = data;

        if (date?.from && date.to) {
            filtered = filtered.filter((invoice) => {
                const invoiceDate = new Date(invoice.date);
                return invoiceDate > date.from! && invoiceDate < date.to!;
            });
        }

        if (status) {
            filtered = filtered.filter((invoice) => {
                return invoice.status.toLocaleLowerCase() === status;
            });
        }

        return filtered;
    }, [data, date, status]);

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
        return calculateTotalInvoicesPrice(selectedRows);
    }, [selectedRows]);

    return (
        <Card>
            <div className="flex flex-col mb-6 md:flex-row space-y-6 md:space-y-0">
                <Title>
                    Selected total:{" "}
                    <span className="font-semibold tracking-tight">
                        {formatPrice(TotalInvoicesPrice)}
                    </span>
                </Title>
            </div>

            <div className="flex items-center py-4 justify-between">
                <div className="flex space-x-4">
                    <DatePickerWithRange date={date} setDate={setDate} />
                    <Select
                        onValueChange={(value) => {
                            setStatus(value);
                        }}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent className="flex items-center">
                            {statuses.map((item) => (
                                <SelectItem
                                    onClick={() => {
                                        if (status === item.value) {
                                            setStatus("");
                                        } else return;
                                    }}
                                    value={item.value}
                                    key={item.value}>
                                    <div className="flex items-center">
                                        {item.label}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button
                    onClick={() => {
                        setIsFormOpen(true);
                    }}
                    className="rounded-lg">
                    Add New <Plus className="ml-2 w-4 h-4" />
                </Button>
            </div>
            <div className="rounded-lg border shadow-sm">
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
                                <TableRow key={row.id}>
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
            <InvoiceForm
                suppliers={[supplier]}
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
            />
        </Card>
    );
}
