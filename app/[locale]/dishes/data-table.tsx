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

import { useToast } from "@/components/ui/use-toast";
import { DataTablePagination } from "@/components/data-table-pagination";
import { Input } from "@/components/ui/input";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { ArrowUpDown, Plus, Search } from "lucide-react";
import { Dish, Ingredient, Recipe } from "@prisma/client";
import { useRouter } from "next/navigation";
import { calculateNetoDishPrice } from "@/lib/utils/calculate-dish-neto-price";
import { formatPrice } from "@/lib/utils/format-price";
import AddDishForm from "@/components/dishes/add-dish-form";

export type DishDataReceived = Dish & {
    ingredients: {
        id: string;
        amount: number;
        dishId: string;
        ingredientId: string | null;
        recipeId: string | null;
        ingredient: Ingredient | null;
        recipe:
            | (Recipe & {
                  ingredients: {
                      id: string;
                      amount: number;
                      recipeId: string;
                      ingredientId: string;
                      ingredient: { price: number };
                  }[];
              })
            | null;
    }[];
};

export type IngredientsAndRecipes = (
    | {
          id: string;
          name: string;
          userId: string;
          unit: string;
          price: number;
          createdAt: Date;
          supplier: string;
          category: string;
          updatedAt: Date;
      }
    | {
          id: string;
          name: string;
          userId: string;
          unit: string;
          yield: number;
          createdAt: Date;
          updatedAt: Date;
      }
)[];

interface DataTableProps {
    ingredientsAndRecipes: IngredientsAndRecipes;
    data: DishDataReceived[];
}

export function DataTable({ data, ingredientsAndRecipes }: DataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [isAddIngredientFormOpen, setIsAddIngredientFormOpen] =
        useState(false);

    const { toast } = useToast();

    const router = useRouter();

    const columns: ColumnDef<DishDataReceived>[] = [
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        className="px-0 group hover:bg-transparent"
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
            accessorKey: "netoPrice",
            header: ({ column }) => {
                return (
                    <Button
                        className="px-0 group hover:bg-transparent"
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }>
                        NETO PRICE
                        <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) =>
                formatPrice(calculateNetoDishPrice(row.original)),
        },

        {
            accessorKey: "multiplier",
            header: "MULTIPLIER",
        },
        {
            accessorKey: "targetPrice",
            header: ({ column }) => {
                return (
                    <Button
                        className="px-0 group hover:bg-transparent"
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }>
                        TARGET PRICE
                        <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => formatPrice(row.original.targetPrice),
        },
        {
            header: "TOTAL PRICE",
            cell: ({ row }) => {
                const netoPrice = calculateNetoDishPrice(row.original);
                const multiplier = row.getValue("multiplier") as number;
                const totalPrice = netoPrice * multiplier;

                const targetPrice = row.getValue("targetPrice") as number;

                return (
                    <div
                        className={clsx(
                            totalPrice > targetPrice && "text-red-500"
                        )}>
                        {formatPrice(totalPrice)}
                    </div>
                );
            },
        },
        // {
        //     id: "actions",
        //     cell: ({ row }) => {
        //         const recipeIngredient = row.original;
        //         return <RecipeActions recipeIngredient={recipeIngredient} />;
        //     },
        // },
    ];

    const table = useReactTable({
        data,
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

    return (
        <>
            <div className="flex items-center py-4 justify-between">
                <div className="relative w-80">
                    <Search className="absolute top-0 bottom-0 w-4 h-4 my-auto text-gray-500 left-3" />
                    <Input
                        placeholder="Search dish..."
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

                <Button
                    onClick={() => setIsAddIngredientFormOpen(true)}
                    className="rounded-lg">
                    Add dish <Plus className="ml-2 w-4 h-4" />
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
            <AddDishForm
                ingredientsAndRecipes={ingredientsAndRecipes}
                isOpen={isAddIngredientFormOpen}
                setIsOpen={setIsAddIngredientFormOpen}
            />
        </>
    );
}
