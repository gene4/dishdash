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
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    ArrowUpDown,
    Edit,
    MoreHorizontal,
    Plus,
    Search,
    Trash2,
} from "lucide-react";
import { Delivery, DeliveryPrice } from "@prisma/client";
import { formatPrice } from "@/lib/utils/format-price";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import ItemActions from "./item-actions";
import ItemForm from "@/components/delivery/item-form";
import EditDeliveryForm from "@/components/delivery/edit-delivery-form";

export function DataTable({
    delivery,
}: {
    delivery: Delivery & { items: DeliveryPrice[] };
}) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDeliveryFormOpen, setIsEditDeliveryFormOpen] = useState(false);
    const [isItemFormOpen, setIsItemFormOpen] = useState(false);

    const { push } = useRouter();

    const columns: ColumnDef<DeliveryPrice>[] = [
        {
            id: "ingredient.name",
            accessorKey: "ingredient.name",
            header: ({ column }) => {
                return (
                    <Button
                        className="px-0 group font-bold hover:bg-transparent"
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }>
                        ITEM
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
            id: "pricePerUnit",
            header: ({ column }) => {
                return (
                    <Button
                        className="px-0 group font-bold hover:bg-transparent w-max"
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }>
                        PRICE PER UNIT
                        <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) =>
                formatPrice(row.original.price / row.original.amount),
        },
        {
            accessorKey: "price",
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
            cell: ({ row }) => formatPrice(row.original.price),
        },

        {
            id: "actions",
            cell: ({ row }) => {
                return <ItemActions row={row} />;
            },
        },
    ];

    const table = useReactTable({
        data: delivery.items,
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
            .delete(`/api/delivery/${delivery.id}`)
            .then(() => {
                push("/deliveries");
            });

        toast.promise(response, {
            loading: "Loading...",
            success: () => {
                return `Delivery was deleted.`;
            },
            error: "Error",
        });
    }, [delivery.id, push]);

    return (
        <>
            <div className="flex w-full justify-between mb-4">
                <div className="relative w-40 md:w-80">
                    <Search className="absolute top-0 bottom-0 w-4 h-4 my-auto text-gray-500 left-3" />
                    <Input
                        placeholder="Search item..."
                        value={
                            (table
                                .getColumn("ingredient.name")
                                ?.getFilterValue() as string) ?? ""
                        }
                        onChange={(event) =>
                            table
                                .getColumn("ingredient.name")
                                ?.setFilterValue(event.target.value)
                        }
                        className="pl-9 pr-4"
                    />
                </div>

                <Button
                    onClick={() => setIsItemFormOpen(true)}
                    className="rounded-lg md:ml-auto md:mr-4">
                    Add Item <Plus className="ml-2 w-4 h-4" />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={"outline"} size={"icon"}>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Delivery actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => {
                                setIsEditDeliveryFormOpen(true);
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
            <EditDeliveryForm
                isOpen={isEditDeliveryFormOpen}
                setIsOpen={setIsEditDeliveryFormOpen}
                initialDelivery={delivery}
            />
            <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This delivery will be permanently deleted.
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
            <ItemForm
                initialDelivery={delivery}
                isOpen={isItemFormOpen}
                setIsOpen={setIsItemFormOpen}
            />
        </>
    );
}
