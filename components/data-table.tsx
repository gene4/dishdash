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
    DropdownTrigger,
    Dropdown,
    DropdownMenu,
    DropdownItem,
    Pagination,
    Selection,
    ChipProps,
    SortDescriptor,
} from "@nextui-org/react";
import {
    PlusIcon,
    MoreHorizontal,
    SearchIcon,
    ChevronDownIcon,
} from "lucide-react";
import { formatDate } from "@/utils/format-date";
import { columnsT } from "@/types";

const statusColorMap: Record<string, ChipProps["color"]> = {
    active: "success",
    paused: "danger",
    vacation: "warning",
};

const INITIAL_VISIBLE_COLUMNS = ["name", "role", "status", "actions"];

// type Ingredient = (typeof ingredients)[0];

interface Props {
    data: any;
    columns: columnsT;
}

export default function DataTable({ data, columns }: Props) {
    const [filterValue, setFilterValue] = React.useState("");
    const [selectedKeys, setSelectedKeys] = React.useState<Selection>(
        new Set([])
    );
    // const [visibleColumns, setVisibleColumns] = React.useState<Selection>(
    //     new Set(INITIAL_VISIBLE_COLUMNS)
    // );
    const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
        column: "age",
        direction: "ascending",
    });

    const [page, setPage] = useState(1);

    const hasSearchFilter = Boolean(filterValue);

    const filteredItems = React.useMemo(() => {
        let filteredData = [...data];

        if (hasSearchFilter) {
            filteredData = filteredData.filter((item) =>
                item.name.toLowerCase().includes(filterValue.toLowerCase())
            );
        }
        // {
        //     filteredData = filteredData.filter((user) =>
        //         Array.from(statusFilter).includes(user.status)
        //     );
        // }

        return filteredData;
    }, [data, filterValue, hasSearchFilter]);

    const pages = Math.ceil(filteredItems.length / rowsPerPage);

    const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return filteredItems.slice(start, end);
    }, [page, filteredItems, rowsPerPage]);

    const sortedItems = React.useMemo(() => {
        return [...items].sort((a: any, b: any) => {
            const first = a[sortDescriptor.column as keyof any] as number;
            const second = b[sortDescriptor.column as keyof any] as number;
            const cmp = first < second ? -1 : first > second ? 1 : 0;

            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [sortDescriptor, items]);

    const renderCell = React.useCallback(
        (column: any, columnKey: React.Key) => {
            const cellValue = column[columnKey];

            switch (columnKey) {
                case "price":
                    return (
                        <div>
                            <p>{column.price}€</p>
                        </div>
                    );
                case "updatedAt":
                    return (
                        <div>
                            <p>{formatDate(column.updatedAt)}</p>
                        </div>
                    );
                case "actions":
                    return (
                        <div className="flex justify-center">
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light">
                                        <MoreHorizontal className="text-default-300" />
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu>
                                    <DropdownItem>View</DropdownItem>
                                    <DropdownItem>Edit</DropdownItem>
                                    <DropdownItem>Delete</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    );
                default:
                    return cellValue;
            }
        },
        []
    );

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
                    <div className="flex gap-3">
                        {/* <Dropdown>
                            <DropdownTrigger className="hidden sm:flex">
                                <Button
                                    endContent={
                                        <ChevronDownIcon className="text-small" />
                                    }
                                    variant="flat">
                                    Status
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                disallowEmptySelection
                                aria-label="Table Columns"
                                closeOnSelect={false}
                                selectedKeys={statusFilter}
                                selectionMode="multiple"
                                onSelectionChange={setStatusFilter}>
                                {statusOptions.map((status) => (
                                    <DropdownItem
                                        key={status.uid}
                                        className="capitalize">
                                        {status.name}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown> */}

                        <Button color="primary" endContent={<PlusIcon />}>
                            Add New
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">
                        Total {data.length} ingredients
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
        <Table
            aria-label="Example table with custom cells, pagination and sorting"
            bottomContent={bottomContent}
            fullWidth
            bottomContentPlacement="outside"
            classNames={{
                wrapper: "max-h-[382px]",
            }}
            selectedKeys={selectedKeys}
            selectionMode="multiple"
            sortDescriptor={sortDescriptor}
            topContent={topContent}
            topContentPlacement="outside"
            onSelectionChange={setSelectedKeys}
            onSortChange={setSortDescriptor}>
            <TableHeader
                columns={columns.filter((column) => column.name !== "ID")}>
                {(column) => (
                    <TableColumn
                        key={column.uid}
                        width={column.uid === "actions" ? 2 : null}
                        align={column.uid === "actions" ? "center" : "start"}
                        allowsSorting={column.sortable}>
                        {column.name}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody emptyContent={"No items found"} items={sortedItems}>
                {(item) => (
                    <TableRow key={item.id}>
                        {(columnKey) => (
                            <TableCell>{renderCell(item, columnKey)}</TableCell>
                        )}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
