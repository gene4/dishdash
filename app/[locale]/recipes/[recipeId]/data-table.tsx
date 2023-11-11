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
import {
    ArrowUpDown,
    Loader2,
    MoreHorizontal,
    Plus,
    Search,
    Trash2,
    Edit,
} from "lucide-react";
import { Ingredient, Recipe, RecipeIngredient, Supplier } from "@prisma/client";
import RecipeActions from "./recipe-actions";
import { useRouter } from "next/navigation";
import axios from "axios";
import { formatPrice } from "@/lib/utils/format-price";
import RecipeForm from "@/components/recipes/recipe-form";
import RecipeIngredientForm from "@/components/recipes/recipeIngredient-form";
import { toast } from "sonner";
import { calculateNestedItemPrice } from "@/lib/utils/calculate-recipe-price";

export type RecipeIngredients = {
    amount: number;
    id: string;
    name: string;
    userId: string;
    unit: string;
    price: number;
    createdAt: Date;
    supplierId: string;
    category: string;
    updatedAt: Date;
    recipeIngredientId: string;
};
interface DataTableProps {
    recipe: Recipe & { ingredients: RecipeIngredient[] };
}

export function DataTable({ recipe }: DataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isAddIngredientFormOpen, setIsAddIngredientFormOpen] =
        useState(false);

    const router = useRouter();

    console.log(recipe);

    const columns: ColumnDef<RecipeIngredient>[] = [
        {
            id: "name",
            accessorFn: (row: any) =>
                row.ingredientId
                    ? row.ingredient.name
                    : row.recipeIngredient.name,
            header: ({ column }) => {
                return (
                    <Button
                        className="px-0 group hover:bg-transparent font-bold"
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }>
                        NAME
                        <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                    </Button>
                );
            },
        },
        {
            id: "unit",
            accessorFn: (row: any) =>
                row.ingredientId
                    ? row.ingredient.selectedDeliveryPrice.unit
                    : row.recipeIngredient.unit,
            header: "UNIT",
        },
        {
            accessorKey: "amount",
            header: "AMOUNT",
        },
        {
            id: "pricePerUnit",
            header: ({ column }) => {
                return (
                    <Button
                        className="px-0 group hover:bg-transparent font-bold w-max"
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }>
                        PRICE PER UNIT
                        <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }: { row: any }) => {
                if (row.original.ingredientId) {
                    return formatPrice(
                        row.original.ingredient.selectedDeliveryPrice.price /
                            row.original.ingredient.selectedDeliveryPrice.amount
                    );
                } else {
                    const totalPrice = calculateNestedItemPrice(
                        row.original.recipeIngredient.ingredients
                    );
                    const pricePerUnit =
                        totalPrice / row.original.recipeIngredient.yield;

                    return formatPrice(pricePerUnit);
                }
            },
        },

        {
            id: "totalPrice",
            header: ({ column }) => {
                return (
                    <Button
                        className="px-0 group hover:bg-transparent font-bold w-max"
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }>
                        TOTAL PRICE
                        <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }: { row: any }) => {
                let pricePerUnit;
                if (row.original.ingredientId) {
                    pricePerUnit =
                        row.original.ingredient.selectedDeliveryPrice.price /
                        row.original.ingredient.selectedDeliveryPrice.amount;
                } else {
                    const totalPrice = calculateNestedItemPrice(
                        row.original.recipeIngredient.ingredients
                    );
                    pricePerUnit =
                        totalPrice / row.original.recipeIngredient.yield;
                }
                return formatPrice(pricePerUnit * row.original.amount);
            },
        },
        // {
        //     id: "actions",
        //     cell: ({ row }) => {
        //         const recipeIngredient = row.original;
        //         return (
        //             <RecipeActions
        //                 recipeIngredient={recipeIngredient}
        //             />
        //         );
        //     },
        // },
    ];

    const table = useReactTable({
        data: recipe.ingredients,
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

        const response = axios.delete(`/api/recipe/${recipe.id}`).then(() => {
            router.push("/recipes");
            router.refresh();
        });

        toast.promise(response, {
            loading: "Loading...",
            success: () => {
                return `Recipe ${recipe.name} was deleted.`;
            },
            error: "Error",
        });
    }, [recipe.id, recipe.name, router]);

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
                            <DropdownMenuLabel>
                                Recipe actions
                            </DropdownMenuLabel>
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
                                <TableRow
                                    key={row.id}
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
            <RecipeForm
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
                initialRecipe={recipe}
            />
            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This recipe will be removed from dishes where it
                            might have been included.{" "}
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
            <RecipeIngredientForm
                initialRecipe={recipe}
                isOpen={isAddIngredientFormOpen}
                setIsOpen={setIsAddIngredientFormOpen}
            />
        </>
    );
}
