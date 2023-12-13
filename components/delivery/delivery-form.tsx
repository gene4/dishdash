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
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogCancel,
    AlertDialogTrigger,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { CalendarIcon, Coins, Plus, Trash2 } from "lucide-react";
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
import { calculateDeliverySummary } from "@/lib/utils/calculate-total-invoices-price";
import { formatPrice } from "@/lib/utils/format-price";
import { Ingredient, IngredientVariant } from "@prisma/client";

const deliverySchema = z.object({
    invoiceNr: z.string().optional(),
    supplierId: z.string().min(1, { message: "Supplier is required" }),
    date: z.date({ required_error: "Date is required" }),
    credit: z.coerce.number(),
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
            id: z.string(),
            variant: z.string(),
            unit: z.string(),
            vat: z.string(),
            amount: z.coerce.number(),
            price: z.coerce.number(),
        })
    ),
});

export default function DeliveryForm() {
    const [isIngredientFormOpen, setIsIngredientFormOpen] = useState(false);
    const [isSupplierWindow, setIsSupplierWindow] = useState(false);
    const [isDateWindow, setIsDateWindow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSummeryOpen, setIsSummeryOpen] = useState(false);
    const [summery, setSummery] = useState<{
        nettoSum: number;
        taxAmount7: number;
        taxAmount19: number;
        total: number;
    }>();

    const form = useForm<z.infer<typeof deliverySchema>>({
        resolver: zodResolver(deliverySchema),
        defaultValues: {
            invoiceNr: "",
            supplierId: "",
            credit: 0,
            date: new Date(),
            file: undefined,
            ingredients: [
                { id: "", variant: "", unit: "", vat: "", price: 0, amount: 0 },
            ],
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
        setIsSummeryOpen(false);
        setIsLoading(true);
        const formData = new FormData();

        values.file && formData.append("file", values.file[0]);
        values.invoiceNr && formData.append("invoiceNr", values.invoiceNr);
        formData.append("supplierId", values.supplierId);
        formData.append("credit", values.credit.toString());
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

    const items = form.watch("ingredients");
    const credit = form.watch("credit");

    console.log("ingredients", ingredients.data);

    const labelStyle = "after:content-['*'] after:text-red-500 after:ml-0.5";

    return (
        <>
            <h2 className="border-b w-fit mb-2">General information:</h2>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="space-y-4 md:flex md:space-y-0 md:space-x-8 md:items-end">
                        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8 mt-6">
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
                                            onOpenChange={setIsSupplierWindow}>
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
                                                                  (supplier) =>
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
                                                                (supplier) => (
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
                                                className="w-auto z-50 p-0 bg-background border shadow-md rounded-md"
                                                align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={(event) => {
                                                        setIsDateWindow(false);
                                                        field.onChange(event);
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
                        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
                            <FormField
                                control={form.control}
                                name="invoiceNr"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Invoice number</FormLabel>
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
                    <h2 className="border-b w-fit mt-8">Items:</h2>

                    <div className="border relative rounded-lg max-h-[380px] md:max-h-none overflow-scroll mt-6">
                        <Table>
                            <TableHeader className="shadow-sm sticky top-0 bg-background">
                                <TableRow>
                                    <TableHead>ITEM</TableHead>
                                    <TableHead>VARIANT</TableHead>
                                    <TableHead>UNIT</TableHead>
                                    <TableHead>AMOUNT</TableHead>
                                    <TableHead className="w-[100px]">
                                        TOTAL PRICE
                                    </TableHead>
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
                                                name={`ingredients.${index}.variant`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormControl>
                                                            {items[index].vat &&
                                                                ingredients.data.find(
                                                                    (
                                                                        ingredient: Ingredient
                                                                    ) =>
                                                                        ingredient.id ===
                                                                        items[
                                                                            index
                                                                        ].id
                                                                ).variants
                                                                    .length >
                                                                    0 && (
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
                                                                            {ingredients.data
                                                                                .find(
                                                                                    (
                                                                                        ingredient: Ingredient
                                                                                    ) =>
                                                                                        ingredient.id ===
                                                                                        items[
                                                                                            index
                                                                                        ]
                                                                                            .id
                                                                                )
                                                                                .variants.map(
                                                                                    (
                                                                                        variant: IngredientVariant
                                                                                    ) => (
                                                                                        <SelectItem
                                                                                            key={
                                                                                                variant.id
                                                                                            }
                                                                                            value={
                                                                                                variant.id
                                                                                            }>
                                                                                            {
                                                                                                variant.name
                                                                                            }
                                                                                        </SelectItem>
                                                                                    )
                                                                                )}
                                                                        </SelectContent>
                                                                    </Select>
                                                                )}
                                                        </FormControl>
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
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    field.onChange(
                                                                        parseFloat(
                                                                            event
                                                                                .target
                                                                                .value
                                                                        )
                                                                    )
                                                                }
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
                                                onClick={() => remove(index)}
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

                    <Button
                        type="button"
                        size="sm"
                        defaultValue={undefined}
                        variant={"secondary"}
                        className="rounded-lg border mt-4"
                        onClick={() =>
                            append({
                                id: "",
                                variant: "",
                                unit: "",
                                vat: "",
                                price: 0,
                                amount: 0,
                            })
                        }>
                        <Plus className="mr-2 w-4 h-4" /> Add item
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                type="button"
                                size="sm"
                                variant={"outline"}
                                className="rounded-lg border mt-4 ml-4">
                                <Coins className="mr-2 w-4 h-4" />{" "}
                                {credit == 0
                                    ? "Add credit"
                                    : formatPrice(credit)}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Credit</AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogDescription>
                                The amount in EUR for credit for this delivery
                            </AlertDialogDescription>
                            <FormField
                                control={form.control}
                                name={`credit`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                className="w-16 md:w-20"
                                                type="number"
                                                step={0.01}
                                                min={0}
                                                autoFocus={false}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction>Update</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <p className="text-red-500 text-sm mt-2">
                        {form.formState.errors.ingredients?.message}
                    </p>

                    <div className="flex justify-end pt-5">
                        <Button
                            disabled={isLoading}
                            type="submit"
                            onClick={async (event) => {
                                event.preventDefault();
                                const validation = await form.trigger();
                                if (validation) {
                                    setIsSummeryOpen(true);
                                    setSummery(calculateDeliverySummary(items));
                                }
                            }}>
                            Submit
                        </Button>
                    </div>
                </form>
            </Form>
            <AlertDialog open={isSummeryOpen} onOpenChange={setIsSummeryOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delivery Summery</AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className="text-sm space-y-1">
                        <h2>{`Netto amount: ${
                            summery && formatPrice(summery?.nettoSum)
                        }`}</h2>
                        <h2>{`VAT 7%: ${
                            summery && formatPrice(summery?.taxAmount7)
                        }`}</h2>
                        <h2 className="border-b w-fit">{`VAT 19%: ${
                            summery && formatPrice(summery?.taxAmount19)
                        }`}</h2>
                    </div>
                    {credit != 0 && (
                        <h2 className="text-sm">{`Credit: ${
                            summery && formatPrice(credit)
                        }`}</h2>
                    )}
                    <h2 className="font-semibold ">{`Total amount: ${
                        summery && formatPrice(summery?.total - credit)
                    }`}</h2>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>

                        <AlertDialogAction
                            onClick={form.handleSubmit(onSubmit)}>
                            Submit
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <IngredientPriceForm
                isOpen={isIngredientFormOpen}
                setIsOpen={setIsIngredientFormOpen}
            />
        </>
    );
}
