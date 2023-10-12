"use client";

import {
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

import { DataTablePagination } from "@/components/data-table-pagination";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Dish, Ingredient, Recipe } from "@prisma/client";
import AddDishForm from "@/components/dishes/add-dish-form";
import { columns } from "./columns";
import { useRouter } from "next/navigation";

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

    const router = useRouter();

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
                                    onClick={() =>
                                        router.push(
                                            `/dishes/${row.original.id}`
                                        )
                                    }
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
