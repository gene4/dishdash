"use client";
import React, { useCallback, useState } from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Input,
    Button,
    Pagination,
    Selection,
    SortDescriptor,
    Tooltip,
    useDisclosure,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "@nextui-org/react";
import { PlusIcon, SearchIcon } from "lucide-react";
import { columnsT } from "@/types";
import { formatDate } from "@/lib/utils/format-date";
import { DeleteIcon, EditIcon } from "@/components/icons";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
// import IngredientForm from "./ingredient-form";
import { Recipe } from "@prisma/client";
import RecipesForm from "./recipes-form";

interface Props {
    data: any;
    columns: columnsT;
}

export default function RecipesTable({ data, columns }: Props) {
    const [filterValue, setFilterValue] = React.useState("");
    // const [selectedKeys, setSelectedKeys] = React.useState<Selection>(
    //     new Set([])
    // );
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
        column: "name",
        direction: "ascending",
    });
    const [page, setPage] = useState(1);
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

    const { toast } = useToast();
    const router = useRouter();

    // Filtering

    const hasSearchFilter = Boolean(filterValue);

    const filteredItems = React.useMemo(() => {
        let filteredData = [...data];

        if (hasSearchFilter) {
            filteredData = filteredData.filter((item) =>
                item.name.toLowerCase().includes(filterValue.toLowerCase())
            );
        }

        return filteredData;
    }, [data, filterValue, hasSearchFilter]);

    // Pagination

    const pages = Math.ceil(filteredItems.length / rowsPerPage);

    const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return filteredItems.slice(start, end);
    }, [page, filteredItems, rowsPerPage]);

    const onNextPage = React.useCallback(() => {
        if (page < pages) {
            setPage(page + 1);
        }
    }, [page, pages]);

    const onPreviousPage = React.useCallback(() => {
        if (page > 1) {
            setPage(page - 1);
        }
    }, [page]);

    const onRowsPerPageChange = React.useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setRowsPerPage(Number(e.target.value));
            setPage(1);
        },
        []
    );

    // Sorting

    const sortedItems = React.useMemo(() => {
        return [...items].sort((a: any, b: any) => {
            const first = a[sortDescriptor.column as keyof any] as number;
            const second = b[sortDescriptor.column as keyof any] as number;
            const cmp = first < second ? -1 : first > second ? 1 : 0;

            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [sortDescriptor, items]);

    const onSearchChange = React.useCallback((value?: string) => {
        if (value) {
            setFilterValue(value);
            setPage(1);
        } else {
            setFilterValue("");
        }
    }, []);

    const onClear = useCallback(() => {
        setFilterValue("");
        setPage(1);
    }, []);

    // CRUD functions

    // const onDeleteClick = useCallback(
    //     async (ingredient: Ingredient) => {
    //         setSelectedIngredient(ingredient);
    //         onOpen();
    //     },
    //     [onOpen]
    // );

    // const onDelete = useCallback(
    //     async (ingredient: Ingredient) => {
    //         setIsLoading(true);
    //         try {
    //             await axios.delete(`/api/ingredient/${ingredient.id}`);
    //             onClose();
    //             setIsLoading(false);
    //             toast({
    //                 description: `Ingredient ${ingredient.name} was deleted.`,
    //             });
    //             router.refresh();
    //         } catch (error) {
    //             onClose();
    //             setIsLoading(false);
    //             toast({
    //                 variant: "danger",
    //                 description: "Something went wrong.",
    //             });
    //         }
    //     },
    //     [onClose, router, toast]
    // );

    // const onEdit = (ingredient: Ingredient) => {
    //     setSelectedIngredient(ingredient);
    //     setIsFormOpen(true);
    // };

    const topContent = React.useMemo(() => {
        return (
            <div className="flex flex-col gap-4 mt-6">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        className="w-full sm:max-w-[44%]"
                        placeholder="Search by name..."
                        startContent={<SearchIcon />}
                        value={filterValue}
                        onClear={() => onClear()}
                        onValueChange={onSearchChange}
                    />
                    <Button
                        color="primary"
                        onClick={() => {
                            setSelectedRecipe(null);
                            setIsFormOpen(true);
                        }}
                        endContent={<PlusIcon />}>
                        Add New
                    </Button>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">
                        Total {data.length} recipes
                    </span>
                    <label className="flex items-center text-default-400 text-small">
                        Rows per page:
                        <select
                            className="bg-transparent outline-none text-default-400 text-small"
                            onChange={onRowsPerPageChange}>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                        </select>
                    </label>
                </div>
            </div>
        );
    }, [
        filterValue,
        onSearchChange,
        data.length,
        onRowsPerPageChange,
        onClear,
    ]);

    const renderCell = useCallback((recipe: any, columnKey: React.Key) => {
        const cellValue = recipe[columnKey as keyof Recipe];
        // Calculate the total price of the recipe
        const totalPrice = recipe.ingredients.reduce(
            (acc: number, ingredient: any) => {
                const { amount } = ingredient;
                const ingredientPrice = ingredient.ingredient?.price || 0; // Access the ingredient's price
                return acc + amount * ingredientPrice;
            },
            0
        );
        const pricePerUnit = recipe.yield / totalPrice;

        switch (columnKey) {
            case "totalPrice":
                return <p>{totalPrice.toFixed(2)}€</p>;
            case "pricePer":
                return <p>{pricePerUnit.toFixed(2)}€</p>;
            case "updatedAt":
                return <p>{formatDate(recipe.updatedAt)}</p>;
            case "actions":
                return (
                    <div className="relative flex items-center gap-2">
                        <Tooltip content="Edit ingredient">
                            <span
                                // onClick={() => onEdit(ingredient)}
                                className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                <EditIcon />
                            </span>
                        </Tooltip>
                        <Tooltip color="danger" content="Delete ingredient">
                            <span
                                // onClick={() => onDeleteClick(ingredient)}
                                className="text-lg text-danger cursor-pointer active:opacity-50">
                                <DeleteIcon />
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return cellValue;
        }
    }, []);

    const bottomContent = React.useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={pages}
                    onChange={setPage}
                />
                <div className="hidden sm:flex w-[30%] justify-end gap-2">
                    <Button
                        isDisabled={pages === 1}
                        size="sm"
                        variant="flat"
                        onPress={onPreviousPage}>
                        Previous
                    </Button>
                    <Button
                        isDisabled={pages === 1}
                        size="sm"
                        variant="flat"
                        onPress={onNextPage}>
                        Next
                    </Button>
                </div>
            </div>
        );
    }, [page, pages, onPreviousPage, onNextPage]);

    return (
        <>
            <Table
                aria-label="Example table with custom cells, pagination and sorting"
                bottomContent={bottomContent}
                fullWidth
                bottomContentPlacement="outside"
                classNames={{
                    wrapper: "max-h-[382px]",
                }}
                // selectedKeys={selectedKeys}
                // selectionMode="multiple"
                sortDescriptor={sortDescriptor}
                topContent={topContent}
                topContentPlacement="outside"
                // onSelectionChange={setSelectedKeys}
                onSortChange={setSortDescriptor}>
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn
                            key={column.uid}
                            width={column.uid === "actions" ? 2 : null}
                            align={
                                column.uid === "actions" ? "center" : "start"
                            }
                            allowsSorting={column.sortable}>
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody emptyContent={"No items found"} items={sortedItems}>
                    {(item: Recipe) => (
                        <TableRow
                            className="cursor-pointer hover:bg-gray-100"
                            key={item.id}>
                            {(columnKey) => (
                                <TableCell>
                                    {renderCell(item, columnKey)}
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <RecipesForm
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
                initialRecipe={selectedRecipe}
            />
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="pt-4">
                                Are you sure you want to delete{" "}
                                {selectedRecipe?.name}?{" "}
                            </ModalHeader>
                            <ModalBody>
                                <p>
                                    This action will delete this ingredient
                                    permanently.
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color="primary"
                                    variant="flat"
                                    onPress={onClose}>
                                    Close
                                </Button>
                                <Button
                                    color="danger"
                                    isLoading={isLoading}
                                    // onPress={() =>
                                    //     onDelete(selectedIngredient!)
                                    // }
                                >
                                    Delete
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
