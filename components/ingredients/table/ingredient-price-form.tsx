"use client";

import React, { useState } from "react";

import { useForm } from "react-hook-form";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { UNIT } from "@/config/constants";
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
import { DeliveryPrice, Ingredient, Supplier } from "@prisma/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import IngredientsCommandBox from "../../ingredients-command-box";

const formSchema = z.object({
    unit: z.string().min(1, { message: "Unit is required" }),
    amount: z.coerce.number().positive({ message: "Amount is required" }),
    weight: z.coerce.number(),
    price: z.coerce.number().positive({ message: "Price is required" }),
    supplierId: z.string(),
});

interface Props {
    initialDeliveryPrice?: DeliveryPrice;
    setIsOpen: (open: boolean) => void;
    ingredientId: string;
    suppliers: Supplier[];
}

export default function IngredientPriceForm({
    initialDeliveryPrice,
    setIsOpen,
    ingredientId,
    suppliers,
}: Props) {
    const [isMultiple, setIsMultiple] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ...initialDeliveryPrice,
            weight: initialDeliveryPrice?.weight || undefined,
            supplierId: initialDeliveryPrice?.supplierId || undefined,
        } || {
            unit: "",
            price: 0,
            amount: 0,
            weight: 0,
        },
    });

    const router = useRouter();

    async function onSubmit(values: z.infer<typeof formSchema>) {
        let response;
        setIsLoading(true);
        if (initialDeliveryPrice) {
            response = axios.patch(
                `/api/ingredient/${initialDeliveryPrice.id}`,
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
                form.reset();
            })
            .finally(() => {
                setIsLoading(false);
            });

        toast.promise(response, {
            loading: "Loading...",
            success: () => {
                return `Price has been ${
                    initialDeliveryPrice ? "updated" : "added"
                }`;
            },
            error: "Error",
        });
    }

    const labelStyle = "after:content-['*'] after:text-red-500 after:ml-0.5";
    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3 mt-5">
                <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={labelStyle}>Unit</FormLabel>
                            <Select
                                value={field.value}
                                disabled={isLoading}
                                onValueChange={field.onChange}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue
                                            className="text-muted-foreground"
                                            placeholder="Select a unit"
                                        />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {UNIT.map((unit) => (
                                        <SelectItem key={unit} value={unit}>
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
                    name="weight"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={labelStyle}>Amount</FormLabel>
                            <FormControl>
                                <Input
                                    disabled={isLoading}
                                    min={0}
                                    type="number"
                                    step={0.01}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={labelStyle}>Amount</FormLabel>
                            <FormControl>
                                <Input
                                    disabled={isLoading}
                                    min={0}
                                    type="number"
                                    step={0.01}
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
                            <FormLabel className={labelStyle}>Price</FormLabel>
                            <FormControl>
                                <Input
                                    disabled={isLoading}
                                    min={0}
                                    type="number"
                                    step={0.01}
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
                        <FormItem className="flex flex-col">
                            <FormLabel className={labelStyle}>
                                Supplier
                            </FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn(
                                                "w-[200px] justify-between",
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
                                        <CommandInput placeholder="Search supplier..." />
                                        <CommandEmpty>
                                            No supplier found.
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {suppliers.map((supplier) => (
                                                <CommandItem
                                                    value={supplier.id}
                                                    key={supplier.id}
                                                    onSelect={() => {
                                                        form.setValue(
                                                            `supplierId`,
                                                            supplier.id
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
                                                    {supplier.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-between pt-5">
                    {!initialDeliveryPrice && (
                        <div className="flex items-center space-x-2">
                            <Switch
                                checked={isMultiple}
                                onCheckedChange={setIsMultiple}
                                id="multiple"
                            />
                            <Label htmlFor="multiple">Add multiple</Label>
                        </div>
                    )}
                    <Button
                        disabled={isLoading}
                        className="rounded-lg"
                        type="submit">
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {initialDeliveryPrice ? "Update" : "Add"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
