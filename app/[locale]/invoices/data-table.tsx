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
import { DataTablePagination } from "@/components/data-table-pagination";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Plus, File, ChevronsUpDown, Check } from "lucide-react";
import { formatDate } from "@/lib/utils/format-date";
import { formatPrice } from "@/lib/utils/format-price";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { DatePickerWithRange } from "@/components/date-picker-range";
import { DateRange } from "react-day-picker";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Supplier } from "@prisma/client";
import InvoiceForm from "@/components/invoices/invoice-form";
import InvoiceActions from "./invoice-actions";
import {
    CheckCircledIcon,
    CircleIcon,
    QuestionMarkCircledIcon,
} from "@radix-ui/react-icons";

export type InvoiceT = {
    supplier: string;
    id: string;
    userId: string;
    supplierId: string;
    invoiceNr: string;
    date: Date;
    status: "paid" | "pending" | "to-pay";
    amount: number;
    fileUrl: string | null;
    fileRef: string | null;
    createdAt: Date;
};

interface DataTableProps {
    data: InvoiceT[];
    suppliers: Supplier[];
}

export const statuses = [
    {
        value: "open",
        label: "Open",
        icon: CircleIcon,
    },
    {
        value: "pending",
        label: "Pending",
        icon: QuestionMarkCircledIcon,
    },

    {
        value: "paid",
        label: "Paid",
        icon: CheckCircledIcon,
    },
];

export function DataTable({ data, suppliers }: DataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [date, setDate] = useState<DateRange | undefined>();
    const [supplierValue, setSupplierValue] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);

    const columns: ColumnDef<InvoiceT>[] = [
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
            accessorKey: "supplier",
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
                        <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{status.label}</span>
                    </div>
                );
            },
        },

        {
            id: "actions",
            cell: ({ row }) => (
                <InvoiceActions suppliers={suppliers} invoice={row.original} />
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

        if (supplierValue) {
            filtered = filtered.filter((invoice) => {
                return invoice.supplier.toLocaleLowerCase() === supplierValue;
            });
        }

        return filtered;
    }, [data, date, supplierValue]);

    const table = useReactTable({
        data: filteredInvoices,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
        },
    });

    return (
        <>
            <div className="flex items-center py-4 justify-between">
                <div className="flex space-x-4">
                    {" "}
                    <DatePickerWithRange date={date} setDate={setDate} />
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                className="w-[200px] justify-between">
                                {supplierValue ? (
                                    suppliers.find(
                                        (supplier) =>
                                            supplier.name.toLocaleLowerCase() ===
                                            supplierValue
                                    )?.name
                                ) : (
                                    <p className="text-muted-foreground">
                                        Select supplier...
                                    </p>
                                )}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                            <Command>
                                <CommandInput placeholder="Search supplier..." />
                                <CommandEmpty>No supplier found.</CommandEmpty>
                                <CommandGroup>
                                    {suppliers.map((supplier) => (
                                        <CommandItem
                                            key={supplier.name}
                                            onSelect={(currentValue) => {
                                                setSupplierValue(
                                                    currentValue ===
                                                        supplierValue
                                                        ? ""
                                                        : currentValue
                                                );
                                            }}>
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    supplierValue ===
                                                        supplier.name.toLocaleLowerCase()
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                )}
                                            />
                                            {supplier.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
                <Button
                    onClick={() => {
                        setIsFormOpen(true);
                    }}
                    className="rounded-lg">
                    Add New <Plus className="ml-2 w-4 h-4" />
                </Button>
            </div>
            <div className="rounded-lg border shadow-md">
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
                suppliers={suppliers}
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
            />
        </>
    );
}
