"use client";

import React, { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@radix-ui/react-popover";
import { CalendarIcon, Plus, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getIngredients, getSuppliers } from "@/lib/actions";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE, UNIT } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import IngredientsCommandBox from "@/components/ingredients-command-box";
import { IngredientPriceForm } from "@/components/ingredients/table/ingredient-price-form";

const deliverySchema = z.object({
    invoiceNr: z.string().optional(),
    supplierId: z.string().min(1, { message: "Supplier is required" }),
    date: z.date({ required_error: "Date is required" }),
    file: z
        .any()
        .refine(
            (files) => files?.[0]?.size <= MAX_FILE_SIZE,
            `Max file size is 5MB.`
        )
        .refine(
            (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
            ".jpg, .jpeg, .png and .pdf files are accepted."
        )
        .optional(),
    ingredients: z.array(
        z.object({
            id: z.string().min(1, { message: "Ingredient is required" }),
            unit: z.string(),
            amount: z.coerce.number(),
            price: z.coerce.number(),
        })
    ),
});

export default function DeliveryForm() {
    const [isIngredientFormOpen, setIsIngredientFormOpen] = useState(false);
    const [isSupplierWindow, setIsSupplierWindow] = useState(false);
    const [isDateWindow, setIsDateWindow] = useState(false);
    const [formProgress, setFormProgress] = useState<1 | 2>(1);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof deliverySchema>>({
        resolver: zodResolver(deliverySchema),
        defaultValues: {
            invoiceNr: "",
            supplierId: "",
            date: undefined,
            file: undefined,
            ingredients: [{ id: "", unit: "", price: 0, amount: 0 }],
        },
    });

    const router = useRouter();

    const ingredients = useQuery({
        queryKey: ["ingredients"],
        queryFn: getIngredients,
    });

    const suppliers = useQuery({
        queryKey: ["suppliers"],
        queryFn: getSuppliers,
    });

    async function onSubmit(values: z.infer<typeof deliverySchema>) {
        setIsLoading(true);
        const formData = new FormData();

        values.file && formData.append("file", values.file[0]);
        values.invoiceNr && formData.append("invoiceNr", values.invoiceNr);
        formData.append("supplierId", values.supplierId);
        formData.append("date", values.date.toString());
        formData.append("ingredients", JSON.stringify(values.ingredients));

        const response = axios.post("/api/delivery", formData);

        toast.promise(response, {
            loading: "Loading...",
            success: () => {
                return `Delivery was added`;
            },
            error: "Error",
        });

        response
            .then(({ data }) => {
                router.push(`/deliveries/${data.id}`);
            })
            .catch(() => {
                setIsLoading(false);
            });
    }

    const { fields, append, remove } = useFieldArray({
        name: "ingredients",
        control: form.control,
    });

    const supplierId = form.watch("supplierId");
    const date = form.watch("date");

    const labelStyle = "after:content-['*'] after:text-red-500 after:ml-0.5";

    return (
        <>
            <div className="mb-16 flex justify-between md:justify-normal md:space-x-24">
                <h1 className="scroll-m-20 text-2xl md:text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                    Receive Delivery
                </h1>
                <div className="flex items-center self-start mr-4 mt-2">
                    <div className="relative flex items-center">
                        <Button
                            size={"icon"}
                            variant={"outline"}
                            onClick={() => setFormProgress(1)}
                            className={cn(
                                "rounded-full transition-all w-6 h-6 border",
                                formProgress === 1 && "border-[3px]"
                            )}>
                            {supplierId && date && formProgress === 2 && (
                                <Check className="w-4 h-4 text-muted-foreground" />
                            )}
                        </Button>
                        <p className="text-xs absolute top-7 text-center right-[-22px]">
                            Initial <br /> information
                        </p>
                    </div>
                    <span className="flex border-[0.5px] w-20" />
                    <div className="relative flex items-center">
                        <Button
                            size={"icon"}
                            variant={"outline"}
                            onClick={() => setFormProgress(2)}
                            className={cn(
                                "rounded-full transition-all w-6 h-6 border",
                                formProgress === 2 && "border-[3px]"
                            )}></Button>
                        <p className="text-xs absolute top-7 text-center  right-[-2px]">
                            Add <br /> items
                        </p>
                    </div>
                </div>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    {formProgress === 1 && (
                        <div className="space-y-4">
                            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 md:pt-4">
                                <FormField
                                    control={form.control}
                                    name={`supplierId`}
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className={labelStyle}>
                                                Supplier
                                            </FormLabel>
                                            <Popover
                                                open={isSupplierWindow}
                                                onOpenChange={
                                                    setIsSupplierWindow
                                                }>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            className={cn(
                                                                "w-[250px] justify-between",
                                                                !field.value &&
                                                                    "text-muted-foreground"
                                                            )}>
                                                            {field.value
                                                                ? suppliers.data &&
                                                                  suppliers.data.find(
                                                                      (
                                                                          supplier
                                                                      ) =>
                                                                          supplier.id ===
                                                                          field.value
                                                                  )?.name
                                                                : "Select supplier"}
                                                            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[250px] relative z-50 bg-background border rounded-md shadow-md">
                                                    <Command>
                                                        <CommandInput placeholder="Search supplier..." />
                                                        <CommandEmpty>
                                                            No supplier found.
                                                        </CommandEmpty>
                                                        <CommandGroup>
                                                            {suppliers.data &&
                                                                suppliers.data.map(
                                                                    (
                                                                        supplier
                                                                    ) => (
                                                                        <CommandItem
                                                                            value={
                                                                                supplier.id
                                                                            }
                                                                            key={
                                                                                supplier.id
                                                                            }
                                                                            onSelect={() => {
                                                                                form.setValue(
                                                                                    `supplierId`,
                                                                                    supplier.id
                                                                                );
                                                                                setIsSupplierWindow(
                                                                                    false
                                                                                );
                                                                            }}>
                                                                            <CheckIcon
                                                                                className={cn(
                                                                                    "mr-2 h-4 w-4",
                                                                                    supplier.id ===
                                                                                        field.value
                                                                                        ? "opacity-100"
                                                                                        : "opacity-0"
                                                                                )}
                                                                            />
                                                                            {
                                                                                supplier.name
                                                                            }
                                                                        </CommandItem>
                                                                    )
                                                                )}
                                                        </CommandGroup>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className={labelStyle}>
                                                Date
                                            </FormLabel>
                                            <Popover
                                                open={isDateWindow}
                                                onOpenChange={setIsDateWindow}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-[250px] pl-3 text-left font-normal",
                                                                !field.value &&
                                                                    "text-muted-foreground"
                                                            )}>
                                                            {field.value ? (
                                                                format(
                                                                    field.value,
                                                                    "dd/MM/yyyy"
                                                                )
                                                            ) : (
                                                                <span>
                                                                    Pick a date
                                                                </span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="w-auto p-0 bg-background border shadow-md rounded-md"
                                                    align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={(event) => {
                                                            setIsDateWindow(
                                                                false
                                                            );
                                                            field.onChange(
                                                                event
                                                            );
                                                        }}
                                                        disabled={(date) =>
                                                            date > new Date() ||
                                                            date <
                                                                new Date(
                                                                    "1900-01-01"
                                                                )
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
                                <FormField
                                    control={form.control}
                                    name="invoiceNr"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Invoice number
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="w-[250px]"
                                                    {...field}
                                                />
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="file"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>PDF / Image</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="file"
                                                    className="w-[250px]"
                                                    accept=".jpg, .jpeg, .png, .pdf"
                                                    onChange={(event) =>
                                                        field.onChange(
                                                            event.target.files
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    )}
                    {formProgress === 2 && (
                        <div className="border relative rounded-lg max-h-[380px] md:max-h-none overflow-scroll">
                            <Table>
                                <TableHeader className="shadow-sm  sticky z-50 top-0 bg-background">
                                    <TableRow className="">
                                        <TableHead>INGREDIENT</TableHead>
                                        <TableHead>UNIT</TableHead>
                                        <TableHead>AMOUNT</TableHead>
                                        <TableHead>TOTAL PRICE</TableHead>
                                        <TableHead />
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="mt-5">
                                    {fields.map((field, index) => (
                                        <TableRow key={field.id}>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`ingredients.${index}.id`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col">
                                                            <IngredientsCommandBox
                                                                field={field}
                                                                index={index}
                                                                ingredients={
                                                                    ingredients.data
                                                                }
                                                                setValue={
                                                                    form.setValue
                                                                }
                                                                setIsIngredientFormOpen={
                                                                    setIsIngredientFormOpen
                                                                }
                                                            />
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`ingredients.${index}.unit`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1">
                                                            <FormControl>
                                                                <Select
                                                                    onValueChange={
                                                                        field.onChange
                                                                    }
                                                                    value={
                                                                        field.value
                                                                    }>
                                                                    <FormControl>
                                                                        <SelectTrigger className="rounded-lg w-20 md:w-24">
                                                                            <SelectValue placeholder="Select" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {UNIT.map(
                                                                            (
                                                                                unit
                                                                            ) => (
                                                                                <SelectItem
                                                                                    key={
                                                                                        unit
                                                                                    }
                                                                                    value={
                                                                                        unit
                                                                                    }>
                                                                                    {
                                                                                        unit
                                                                                    }
                                                                                </SelectItem>
                                                                            )
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`ingredients.${index}.amount`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    className="w-16 md:w-20"
                                                                    type="number"
                                                                    step={0.01}
                                                                    min={0}
                                                                    autoFocus={
                                                                        false
                                                                    }
                                                                    {...field}
                                                                    onKeyDown={(
                                                                        event
                                                                    ) => {
                                                                        if (
                                                                            event.key ===
                                                                            "Enter"
                                                                        ) {
                                                                            event.preventDefault();
                                                                        }
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`ingredients.${index}.price`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    className="w-16 md:w-20"
                                                                    type="number"
                                                                    step={0.01}
                                                                    min={0}
                                                                    autoFocus={
                                                                        false
                                                                    }
                                                                    {...field}
                                                                    onKeyDown={(
                                                                        event
                                                                    ) => {
                                                                        if (
                                                                            event.key ===
                                                                            "Enter"
                                                                        ) {
                                                                            event.preventDefault();
                                                                        }
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    className="rounded-full"
                                                    onClick={() =>
                                                        remove(index)
                                                    }
                                                    size="icon"
                                                    variant="ghost">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    {formProgress === 2 && (
                        <>
                            <Button
                                type="button"
                                size="sm"
                                defaultValue={undefined}
                                variant={"secondary"}
                                className="rounded-lg border mt-4"
                                onClick={() =>
                                    append({
                                        id: "",
                                        unit: "",
                                        price: 0,
                                        amount: 0,
                                    })
                                }>
                                <Plus className="mr-2 w-4 h-4" /> Add item
                            </Button>
                            <p className="text-red-500 text-sm mt-2">
                                {form.formState.errors.ingredients?.message}
                            </p>
                        </>
                    )}
                    <div className="flex justify-end md:justify-start">
                        {formProgress === 1 && supplierId && date && (
                            <Button
                                className="mt-8"
                                onClick={(event) => {
                                    event.preventDefault();
                                    setFormProgress(2);
                                }}
                                type="button">
                                Next
                            </Button>
                        )}
                        {formProgress === 2 && (
                            <Button
                                className="md:mt-2"
                                disabled={isLoading}
                                type="submit">
                                Submit
                            </Button>
                        )}
                    </div>
                </form>
            </Form>

            <IngredientPriceForm
                isOpen={isIngredientFormOpen}
                setIsOpen={setIsIngredientFormOpen}
            />
        </>
    );
}
