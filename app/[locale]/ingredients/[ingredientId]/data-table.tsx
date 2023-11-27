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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTablePagination } from "@/components/data-table-pagination";
import { Input } from "@/components/ui/input";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    ArrowUpDown,
    Check,
    ChevronsUpDown,
    Edit,
    MoreHorizontal,
    Plus,
    Trash2,
} from "lucide-react";
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
import { DeliveryPrice, Ingredient } from "@prisma/client";
import { formatPrice } from "@/lib/utils/format-price";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils/format-date";
import EditIngredientForm from "@/components/ingredients/table/edit-ingredient-form";
import axios from "axios";
import { toast } from "sonner";
import PriceForm from "@/components/ingredients/table/price-form";
import PriceActions from "./price-actions";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/date-picker-range";
import { useQuery } from "@tanstack/react-query";
import { getSuppliers } from "@/lib/actions";
import { cn } from "@/lib/utils";

export function DataTable({
    ingredient,
}: {
    ingredient: Ingredient & { deliveryPrices: DeliveryPrice[] };
}) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditIngredientFormOpen, setIsEditIngredientFormOpen] =
        useState(false);
    const [isPriceFormOpen, setIsPriceFormOpen] = useState(false);
    const [date, setDate] = useState<DateRange | undefined>();
    const [supplierValue, setSupplierValue] = useState("");

    const { push } = useRouter();

    const columns: ColumnDef<DeliveryPrice>[] = [
        {
            accessorKey: "supplier.name",
            header: ({ column }) => {
                return (
                    <Button
                        className="px-0 group font-bold hover:bg-transparent"
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
            accessorKey: "unit",
            header: ({ column }) => {
                return (
                    <Button
                        className="px-0 font-bold group hover:bg-transparent"
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }>
                        UNIT
                        <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                    </Button>
                );
            },
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
        },
        {
            accessorKey: "price",
            header: ({ column }) => {
                return (
                    <Button
                        className="px-0 group font-bold hover:bg-transparent"
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }>
                        PRICE
                        <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => formatPrice(row.original.price),
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
            id: "selectedDeliveryPrice",
            header: () => <div className="w-max">PRICE PER UNIT</div>,
            cell: ({ row }) => {
                return formatPrice(row.original.price / row.original.amount);
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                return (
                    <PriceActions
                        selectedPriceId={ingredient.selectedDeliveryPriceId}
                        row={row}
                    />
                );
            },
        },
    ];

    const processedPrices = useMemo(() => {
        // Filter invoices by date and supplier
        if (!ingredient.deliveryPrices || !ingredient.deliveryPrices.length) {
            return [];
        }

        // Bring selected price first
        let deliveryPrices = ingredient.deliveryPrices.sort((a, b) => {
            if (a.id === ingredient.selectedDeliveryPriceId) {
                return -1;
            } else if (a.id === ingredient.selectedDeliveryPriceId) {
                return 1;
            } else {
                return 0;
            }
        });

        if (date?.from && date.to) {
            deliveryPrices = deliveryPrices.filter((price) => {
                const invoiceDate = new Date(price.date);
                return invoiceDate > date.from! && invoiceDate < date.to!;
            });
        }

        if (supplierValue) {
            deliveryPrices = deliveryPrices.filter((price) => {
                return price.supplierId === supplierValue;
            });
        }

        return deliveryPrices;
    }, [
        date,
        ingredient.deliveryPrices,
        ingredient.selectedDeliveryPriceId,
        supplierValue,
    ]);

    const suppliers = useQuery({
        queryKey: ["suppliers"],
        queryFn: getSuppliers,
    });

    const table = useReactTable({
        data: processedPrices,
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

    const onDelete = useCallback(async () => {
        setIsDeleteDialogOpen(false);

        const response = axios
            .delete(`/api/ingredient/${ingredient.id}`)
            .then(() => {
                push("/ingredients");
            });

        toast.promise(response, {
            loading: "Loading...",
            success: () => {
                return `Ingredient ${ingredient.name} was deleted.`;
            },
            error: "Error",
        });
    }, [ingredient.id, ingredient.name, push]);

    return (
        <>
            <div className="flex flex-col-reverse md:flex-row md:items-center py-4 md:space-x-4">
                <DatePickerWithRange date={date} setDate={setDate} />
                <div className="flex justify-between space-x-2 w-full">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                className="w-[180px] justify-between group">
                                {supplierValue ? (
                                    suppliers.data &&
                                    suppliers.data.find(
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
                        <PopoverContent className="w-[180px] p-0">
                            <Command>
                                <CommandInput placeholder="Search..." />
                                <CommandEmpty>No supplier found.</CommandEmpty>
                                <CommandGroup>
                                    {suppliers.data &&
                                        suppliers.data.map((supplier) => (
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
                    <div className="flex  md:w-fit space-x-2 mb-4 md:mb-0">
                        <Button
                            onClick={() => setIsPriceFormOpen(true)}
                            className="rounded-lg ml-auto">
                            Add <Plus className="ml-2 w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant={"outline"} size={"icon"}>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>
                                    Ingredient actions
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => {
                                        setIsEditIngredientFormOpen(true);
                                        document.body.style.pointerEvents = "";
                                    }}
                                    className="flex items-center justify-between">
                                    Edit <Edit className="w-4 h-4" />
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setIsDeleteDialogOpen(true);
                                        document.body.style.pointerEvents = "";
                                    }}
                                    className="flex items-center justify-between text-red-500 focus:text-white focus:bg-red-500">
                                    Delete <Trash2 className="w-4 h-4" />
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
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
                                <TableRow
                                    // className={clsx(
                                    //     row.original.id ===
                                    //         ingredient.selectedDeliveryPriceId &&
                                    //         "bg-muted hover:bg-muted"
                                    // )}
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
            <EditIngredientForm
                isOpen={isEditIngredientFormOpen}
                setIsOpen={setIsEditIngredientFormOpen}
                initialIngredient={ingredient}
            />
            <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This ingredient will be removed from recipes or
                            dishes where it might have been included.{" "}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={onDelete}
                            className="bg-red-500 hover:bg-red-500/90">
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <PriceForm
                isOpen={isPriceFormOpen}
                setIsOpen={setIsPriceFormOpen}
                ingredientId={ingredient.id}
            />
        </>
    );
}
