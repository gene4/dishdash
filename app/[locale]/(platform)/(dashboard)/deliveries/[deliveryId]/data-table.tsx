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
import DeliveryForm from "@/components/delivery/delivery-form";
import SortButton from "@/components/sort-button";

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
                return <SortButton column={column} label="ITEM" />;
            },
        },
        {
            accessorKey: "unit",
            header: ({ column }) => {
                return <SortButton column={column} label="UNIT" />;
            },
        },

        {
            accessorKey: "amount",
            header: ({ column }) => {
                return <SortButton column={column} label="AMOUNT" />;
            },
        },
        {
            id: "pricePerUnit",
            header: ({ column }) => {
                return <SortButton column={column} label="PRICE PER UNIT" />;
            },
            cell: ({ row }) =>
                formatPrice(row.original.price / row.original.amount),
        },
        {
            accessorKey: "price",
            header: ({ column }) => {
                return <SortButton column={column} label="TOTAL PRICE" />;
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

    const isCredit = delivery.items.length === 0 && !!delivery.credit;

    return (
        <>
            <div className="flex w-full justify-between mb-4">
                <div className="relative w-40 md:w-60">
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

            <Dialog
                open={isEditDeliveryFormOpen}
                onOpenChange={setIsEditDeliveryFormOpen}>
                <DialogContent className="md:w-fit">
                    <DialogHeader>
                        <DialogTitle>
                            Edit {isCredit ? "Credit" : "Delivery"}
                        </DialogTitle>
                    </DialogHeader>
                    <DeliveryForm
                        isCredit={isCredit}
                        initialDelivery={delivery}
                        setIsDialog={setIsEditDeliveryFormOpen}
                    />
                </DialogContent>
            </Dialog>
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
        </>
    );
}
