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
import { ArrowUpDown, Plus, ChevronsUpDown, Check } from "lucide-react";
import { formatDate } from "@/lib/utils/format-date";
import { formatPrice } from "@/lib/utils/format-price";
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
import { Delivery, Supplier } from "@prisma/client";
import InvoiceActions from "./invoice-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { calculateTotalInvoicesPrice } from "@/lib/utils/calculate-total-invoices-price";
import { useQuery } from "@tanstack/react-query";
import { getDeliveries } from "@/lib/actions";
import { useRouter } from "next/navigation";

export function DataTable({ suppliers }: { suppliers: Supplier[] }) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [date, setDate] = useState<DateRange | undefined>();
    const [supplierValue, setSupplierValue] = useState("");
    const [rowSelection, setRowSelection] = useState({});

    const { push } = useRouter();

    const columns: ColumnDef<Delivery>[] = [
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
            id: "actions",
            cell: ({ row }) => (
                <InvoiceActions suppliers={suppliers} invoice={row.original} />
            ),
        },
    ];

    const { data } = useQuery({
        queryKey: ["deliveries"],
        queryFn: getDeliveries,
    });

    const filteredInvoices = useMemo(() => {
        // Filter invoices by date and supplier
        if (!data || !data.length) {
            return [];
        }

        let filtered = data as Delivery[];

        if (date?.from && date.to) {
            filtered = filtered.filter((invoice) => {
                const invoiceDate = new Date(invoice.date);
                return invoiceDate > date.from! && invoiceDate < date.to!;
            });
        }

        if (supplierValue) {
            filtered = filtered.filter((invoice) => {
                return invoice.id === supplierValue;
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
        <>
            <div className="flex flex-col mb-10 md:flex-row space-y-6 md:space-y-0 justify-between items-start overflow-y-scroll">
                <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                    Deliveries
                </h1>
                <h1 className="text-2xl md:border-b">
                    Selected total:{" "}
                    <span className="font-semibold tracking-tight">
                        {formatPrice(TotalInvoicesPrice)}
                    </span>
                </h1>
            </div>

            <div className="flex flex-col-reverse md:flex-row md:items-center py-4 md:space-x-4">
                <DatePickerWithRange date={date} setDate={setDate} />
                <div className="flex justify-between mb-4 md:mb-0 w-full">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                className="w-[180px] justify-between group">
                                {supplierValue ? (
                                    suppliers.find(
                                        (supplier) =>
                                            supplier.id === supplierValue
                                    )?.name
                                ) : (
                                    <p className="text-muted-foreground group-hover:text-foreground font-normal">
                                        Filter by supplier...
                                    </p>
                                )}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                            <Command>
                                <CommandInput />
                                <CommandEmpty>No supplier found.</CommandEmpty>
                                <CommandGroup>
                                    {suppliers.map((supplier) => (
                                        <CommandItem
                                            value={supplier.id}
                                            key={supplier.id}
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
                                                        supplier.id
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

                    <Button
                        onClick={() => push("/deliveries/add-delivery")}
                        className="rounded-lg md:ml-auto">
                        Add New <Plus className="ml-2 w-4 h-4" />
                    </Button>
                </div>
            </div>
            <div className="rounded-lg border shadow-md overflow-scroll">
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
        </>
    );
}
