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
import { Ingredient, Recipe } from "@prisma/client";
import RecipeActions from "./recipe-actions";
import { useRouter } from "next/navigation";
import axios from "axios";
import EditRecipeForm from "@/components/recipes/edit-recipe-form";
import AddRecipeIngredientForm from "@/components/recipes/add-recipeIngredient-form";
import { formatPrice } from "@/lib/utils/format-price";

export type RecipeIngredients = {
    amount: number;
    id: string;
    name: string;
    userId: string;
    unit: string;
    price: number;
    createdAt: Date;
    supplier: string;
    category: string;
    updatedAt: Date;
    recipeIngredientId: string;
};

interface DataTableProps {
    recipeIngredients: RecipeIngredients[];
    ingredients: Ingredient[];
    recipe: Recipe;
}

export function DataTable({
    recipeIngredients,
    ingredients,
    recipe,
}: DataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isAddIngredientFormOpen, setIsAddIngredientFormOpen] =
        useState(false);

    const { toast } = useToast();

    const router = useRouter();

    const columns: ColumnDef<RecipeIngredients>[] = [
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
            cell: ({ row }) => formatPrice(row.original.price),
        },

        {
            accessorKey: "supplier",
            header: ({ column }) => {
                return (
                    <Button
                        className="px-0 group hover:bg-transparent font-bold"
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
            accessorKey: "category",
            header: ({ column }) => {
                return (
                    <Button
                        className="px-0 group hover:bg-transparent font-bold"
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }>
                        CATEGORY
                        <ArrowUpDown className="text-transparent group-hover:text-foreground transition-all ml-2 h-4 w-4" />
                    </Button>
                );
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
                const totalPrice = row.original.price * row.original.amount;

                return formatPrice(totalPrice);
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const recipeIngredient = row.original;
                return <RecipeActions recipeIngredient={recipeIngredient} />;
            },
        },
    ];

    const table = useReactTable({
        data: recipeIngredients,
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
        setIsLoading(true);
        try {
            await axios.delete(`/api/recipe/${recipe.id}`);
            setIsDeleteDialogOpen(false);
            setIsLoading(false);
            router.push("/recipes");
            toast({
                description: `Recipe ${recipe.name} was deleted.`,
            });
            router.refresh();
        } catch (error) {
            setIsLoading(false);
            setIsDeleteDialogOpen(false);
            toast({
                variant: "danger",
                description: "Something went wrong.",
            });
        }
    }, [recipe.id, recipe.name, router, toast]);

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
            <EditRecipeForm
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
                            disabled={isLoading}
                            onClick={onDelete}
                            className="bg-red-500 hover:bg-red-500/90">
                            {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AddRecipeIngredientForm
                recipeId={recipe.id}
                ingredients={ingredients}
                isOpen={isAddIngredientFormOpen}
                setIsOpen={setIsAddIngredientFormOpen}
            />
        </>
    );
}
