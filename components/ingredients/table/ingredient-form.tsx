"use client";

import React, { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { Unit } from "@/config/constants";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@radix-ui/react-popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import { toast } from "sonner";
import { Ingredient, Supplier } from "@prisma/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    unit: z.string({ required_error: "Unit is required" }),
    amount: z.coerce.number(),
    price: z.coerce.number(),
    category: z.string().min(1, { message: "Category is required" }),
    supplierId: z.string().min(1, { message: "Supplier is required" }),
});

interface Props {
    initialIngredient?: Ingredient;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    suppliers: Supplier[];
}

function IngredientForm({
    initialIngredient,
    isOpen,
    setIsOpen,
    suppliers,
}: Props) {
    const [isMultiple, setIsMultiple] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialIngredient || {
            name: "",
            price: undefined,
            category: "",
            supplierId: "",
        },
    });

    const router = useRouter();

    async function onSubmit(values: z.infer<typeof formSchema>) {
        let response;
        setIsLoading(true);
        if (initialIngredient) {
            response = axios.patch(
                `/api/ingredient/${initialIngredient.id}`,
                values
            );
        } else {
            response = axios.post("/api/ingredient", values);
        }

        if (!isMultiple) {
            setIsOpen(false);
        }
        response
            .then(() => {
                router.refresh();
                !isMultiple && form.reset();
            })
            .finally(() => {
                setIsLoading(false);
            });

        toast.promise(response, {
            loading: "Loading...",
            success: () => {
                return `${values.name}  has been ${
                    initialIngredient ? "updated" : "added"
                }`;
            },
            error: "Error",
        });
    }

    const labelStyle = "after:content-['*'] after:text-red-500 after:ml-0.5";
    return (
        <Sheet
            open={isOpen}
            onOpenChange={setIsOpen}>
            <SheetContent side={"left"}>
                <SheetHeader>
                    <SheetTitle className="text-3xl font-semibold">
                        {initialIngredient ? "Update" : "Add"} Ingredient
                    </SheetTitle>
                    {!initialIngredient && (
                        <SheetDescription>
                            Add a new ingredient to your list
                        </SheetDescription>
                    )}
                </SheetHeader>
                <div>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-3 mt-5">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelStyle}>
                                            Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={isLoading}
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="unit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelStyle}>
                                            Unit
                                        </FormLabel>
                                        <Select
                                            disabled={isLoading}
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a unit" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Unit.map((unit) => (
                                                    <SelectItem
                                                        key={unit}
                                                        value={unit}>
                                                        {unit}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelStyle}>
                                            Amount
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={isLoading}
                                                min={0}
                                                type="number"
                                                step={0.1}
                                                {...field}
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelStyle}>
                                            Price
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={isLoading}
                                                min={0}
                                                type="number"
                                                step={0.1}
                                                {...field}
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`supplierId`}
                                render={({ field }) => (
                                    <FormItem className="flex flex-col pt-[10px]">
                                        <FormLabel className={labelStyle}>
                                            Supplier
                                        </FormLabel>
                                        <Popover
                                            open={isPopoverOpen}
                                            onOpenChange={setIsPopoverOpen}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            "justify-between",
                                                            !field.value &&
                                                                "text-muted-foreground"
                                                        )}>
                                                        {field.value
                                                            ? suppliers.find(
                                                                  (supplier) =>
                                                                      supplier.id ===
                                                                      field.value
                                                              )?.name
                                                            : "Select supplier"}
                                                        <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[200px] relative z-50 bg-background border rounded-md shadow-md">
                                                <Command>
                                                    <CommandInput
                                                        disabled={isLoading}
                                                        placeholder="Search supplier..."
                                                    />
                                                    <CommandEmpty>
                                                        No supplier found.
                                                    </CommandEmpty>
                                                    <CommandGroup>
                                                        {suppliers.map(
                                                            (supplier) => (
                                                                <CommandItem
                                                                    value={
                                                                        supplier.name
                                                                    }
                                                                    key={
                                                                        supplier.id
                                                                    }
                                                                    onSelect={() => {
                                                                        form.setValue(
                                                                            `supplierId`,
                                                                            supplier.id
                                                                        );
                                                                        setIsPopoverOpen(
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
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelStyle}>
                                            Category
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={isLoading}
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-between pt-5">
                                {!initialIngredient && (
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={isMultiple}
                                            onCheckedChange={setIsMultiple}
                                            id="multiple"
                                        />
                                        <Label htmlFor="multiple">
                                            Add multiple
                                        </Label>
                                    </div>
                                )}
                                <Button
                                    disabled={isLoading}
                                    className="rounded-lg"
                                    type="submit">
                                    {isLoading && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {initialIngredient ? "Update" : "Add"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default IngredientForm;
