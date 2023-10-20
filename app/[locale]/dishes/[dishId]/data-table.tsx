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
import { useToast } from "@/components/ui/use-toast";
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
import { Dish } from "@prisma/client";
import RecipeActions from "./dish-actions";
import { useRouter } from "next/navigation";
import axios from "axios";
import { formatPrice } from "@/lib/utils/format-price";
import { IngredientsAndRecipes } from "../data-table";
import DishIngredientForm from "@/components/dishes/dishIngredient-form";
import { calculateRecipePrice } from "@/lib/utils/calculate-recipe-price";
import DishForm from "@/components/dishes/dish-form";
import { toast } from "sonner";

export type DishIngredients = {
    amount: number;
    id: string | undefined;
    name: string;
    userId: string;
    unit: string;
    price?: number;
    createdAt: Date;
    yield?: number;
    updatedAt: Date;
    dishIngredientId: string;
    ingredients?: {
        ingredient: {
            price: number;
            amount: number;
        };
        id: string;
        amount: number;
        recipeId: string;
        ingredientId: string;
    }[];
};

interface DataTableProps {
    dishIngredients: DishIngredients[];
    ingredientsAndRecipes: IngredientsAndRecipes;
    dish: Dish;
}

export function DataTable({
    dishIngredients,
    ingredientsAndRecipes,
    dish,
}: DataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isAddIngredientFormOpen, setIsAddIngredientFormOpen] =
        useState(false);

    const router = useRouter();

    const columns: ColumnDef<DishIngredients>[] = [
        {
            accessorKey: "name",
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
            accessorKey: "unit",
            header: "UNIT",
        },
        {
            accessorKey: "amount",
            header: "AMOUNT",
        },
        {
            accessorKey: "price",
            header: ({ column }) => {
                return (
                    <Button
                        className="px-0 group hover:bg-transparent font-bold"
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }>
                        PRICE PER UNIT
                        <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                if ("yield" in row.original) {
                    const totalRecipePrice = calculateRecipePrice(
                        row.original.ingredients
                    );

                    const pricePerUnit = totalRecipePrice / row.original.yield!;
                    return formatPrice(pricePerUnit);
                } else {
                    return formatPrice(row.original.price!);
                }
            },
        },

        {
            accessorKey: "totalPrice",
            header: ({ column }) => {
                return (
                    <Button
                        className="px-0 group hover:bg-transparent font-bold"
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }>
                        TOTAL PRICE
                        <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                // If a recipe
                if ("yield" in row.original) {
                    const totalRecipePrice = calculateRecipePrice(
                        row.original.ingredients
                    );
                    const pricePerUnit = totalRecipePrice / row.original.yield!;
                    return formatPrice(pricePerUnit * row.original.amount);
                    // If an ingredient
                } else {
                    const totalPrice =
                        row.original.price! * row.original.amount;

                    return formatPrice(totalPrice);
                }
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const dishIngredient = row.original;
                return (
                    <RecipeActions
                        ingredientsAndRecipes={ingredientsAndRecipes}
                        dishIngredient={dishIngredient}
                    />
                );
            },
        },
    ];

    const table = useReactTable({
        data: dishIngredients,
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
            <div className="flex items-center py-4 justify-between">
                <div className="relative w-80">
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
                <div className="flex space-x-2">
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
                                    className="cursor-pointer"
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
                dishId={dish.id}
                ingredientsAndRecipes={ingredientsAndRecipes}
                isOpen={isAddIngredientFormOpen}
                setIsOpen={setIsAddIngredientFormOpen}
            />
        </>
    );
}
