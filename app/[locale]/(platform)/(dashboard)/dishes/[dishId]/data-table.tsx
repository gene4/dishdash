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
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { MoreHorizontal, Plus, Search, Trash2, Edit, Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dish, DishIngredient } from "@prisma/client";
import { useRouter } from "next/navigation";
import axios from "axios";
import { formatPrice } from "@/lib/utils/format-price";
import DishIngredientForm from "@/components/dishes/dishIngredient-form";
import DishForm from "@/components/dishes/dish-form";
import { toast } from "sonner";
import { calculateNestedItemPrice } from "@/lib/utils/calculate-recipe-price";
import DishActions from "./dish-actions";
import SortButton from "@/components/sort-button";
import Link from "next/link";

interface DataTableProps {
    dish: Dish & { ingredients: DishIngredient[] };
}

export function DataTable({ dish }: DataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isAddIngredientFormOpen, setIsAddIngredientFormOpen] =
        useState(false);

    const router = useRouter();

    const columns: ColumnDef<DishIngredient>[] = [
        {
            id: "name",
            accessorFn: (row: any) =>
                row.ingredientId
                    ? row.ingredient.name
                    : row.recipeIngredient.name,
            header: ({ column }) => {
                return <SortButton column={column} label="NAME" />;
            },
            cell: ({ row }: { row: any }) => (
                <Link
                    href={
                        row.original.ingredientId
                            ? `/ingredients/${row.original.ingredientId}`
                            : `/recipes/${row.original.recipeIngredientId}`
                    }>
                    {row.original.ingredientId
                        ? row.original.ingredient.name
                        : row.original.recipeIngredient.name}
                </Link>
            ),
        },
        {
            accessorKey: "unit",
            header: "UNIT",
        },
        {
            accessorKey: "amount",
            header: "AMOUNT",
        },
        {
            id: "pricePerUnit",
            header: ({ column }) => {
                return <SortButton column={column} label="PRICE PER UNIT" />;
            },
            cell: ({ row }: { row: any }) => {
                const recipeIngredient = row.original;
                if (recipeIngredient.ingredientId) {
                    if (!recipeIngredient.ingredient.selectedDeliveryPrice) {
                        return (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-4 w-4" />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-secondary text-secondary-foreground rounded-3xl">
                                        Please select a price for this
                                        ingredient
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        );
                    }
                    if (
                        recipeIngredient.unit === "Kg" &&
                        recipeIngredient.ingredient.selectedDeliveryPrice
                            .unit === "Piece"
                    ) {
                        if (
                            !recipeIngredient.ingredient.selectedDeliveryPrice
                                .ingredientVariant
                        ) {
                            return (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-4 w-4" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-secondary text-secondary-foreground rounded-3xl">
                                            Please specify a weight variant for
                                            piece to weight conversion
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            );
                        } else {
                            return formatPrice(
                                recipeIngredient.ingredient
                                    .selectedDeliveryPrice.price /
                                    recipeIngredient.ingredient
                                        .selectedDeliveryPrice.ingredientVariant
                                        .wightPerPiece
                            );
                        }
                    } else {
                        return formatPrice(
                            recipeIngredient.ingredient.selectedDeliveryPrice
                                .price /
                                recipeIngredient.ingredient
                                    .selectedDeliveryPrice.amount
                        );
                    }
                } else {
                    const totalPrice = calculateNestedItemPrice(
                        recipeIngredient.recipeIngredient.ingredients
                    );
                    const pricePerUnit =
                        totalPrice / recipeIngredient.recipeIngredient.yield;

                    return formatPrice(pricePerUnit);
                }
            },
        },

        {
            id: "totalPrice",
            header: ({ column }) => {
                return <SortButton column={column} label="TOTAL PRICE" />;
            },
            cell: ({ row }: { row: any }) => {
                let pricePerUnit;
                const recipeIngredient = row.original;

                if (row.original.ingredientId) {
                    if (!row.original.ingredient.selectedDeliveryPrice) {
                        return "N/A";
                    }
                    if (
                        recipeIngredient.unit === "Kg" &&
                        recipeIngredient.ingredient.selectedDeliveryPrice
                            .unit === "Piece"
                    ) {
                        if (
                            !recipeIngredient.ingredient.selectedDeliveryPrice
                                .ingredientVariant
                        ) {
                            return "N/A";
                        } else {
                            pricePerUnit =
                                recipeIngredient.ingredient
                                    .selectedDeliveryPrice.price /
                                recipeIngredient.ingredient
                                    .selectedDeliveryPrice.ingredientVariant
                                    .wightPerPiece;
                        }
                    } else {
                        pricePerUnit =
                            recipeIngredient.ingredient.selectedDeliveryPrice
                                .price /
                            recipeIngredient.ingredient.selectedDeliveryPrice
                                .amount;
                    }
                } else {
                    const totalPrice = calculateNestedItemPrice(
                        recipeIngredient.recipeIngredient.ingredients
                    );
                    pricePerUnit =
                        totalPrice / recipeIngredient.recipeIngredient.yield;
                }
                return formatPrice(pricePerUnit * recipeIngredient.amount);
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const dishIngredient = row.original;
                return (
                    <DishActions
                        dishIngredient={dishIngredient}
                        initialDish={dish}
                    />
                );
            },
        },
    ];

    const table = useReactTable({
        data: dish.ingredients,
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

        const response = axios.delete(`/api/dish/${dish.id}`).then(() => {
            router.push("/dishes");
            router.refresh();
        });

        toast.promise(response, {
            loading: "Loading...",
            success: () => {
                return `Dish ${dish.name} was deleted.`;
            },
            error: "Error",
        });
    }, [dish.id, dish.name, router]);

    return (
        <>
            <div className="flex flex-col-reverse md:flex-row items-center py-4 justify-between">
                <div className="relative w-full md:w-80">
                    <Search className="absolute top-0 bottom-0 w-4 h-4 my-auto text-gray-500 left-3" />
                    <Input
                        placeholder="Search ingredient..."
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
                <div className="flex justify-between w-full md:w-fit space-x-2 mb-4 md:mb-0">
                    <Button
                        onClick={() => setIsAddIngredientFormOpen(true)}
                        className="rounded-lg">
                        Add Ingredient <Plus className="ml-2 w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={"outline"} size={"icon"}>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Dish actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => {
                                    setIsFormOpen(true);
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
                                    key={row.id}
                                    className="hover:bg-muted/50"
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }>
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

            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your dish.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button
                            onClick={onDelete}
                            className="bg-red-500 hover:bg-red-500/90">
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <DishForm
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
                initialDish={dish}
            />
            <DishIngredientForm
                initialDish={dish}
                isOpen={isAddIngredientFormOpen}
                setIsOpen={setIsAddIngredientFormOpen}
            />
        </>
    );
}
