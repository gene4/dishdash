"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { DeliveryPrice } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getSuppliers } from "@/lib/actions";

const formSchema = z.object({
    unit: z.string().min(1, { message: "Unit is required" }),
    amount: z.coerce.number().positive({ message: "Amount is required" }),
    weight: z.coerce.number().optional(),
    price: z.coerce.number().positive({ message: "Price is required" }),
    supplierId: z.string().min(1, { message: "Supplier is required" }),
});

interface Props {
    initialPrice?: DeliveryPrice;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    ingredientId?: string;
}

export default function PriceForm({
    initialPrice,
    isOpen,
    setIsOpen,
    ingredientId,
}: Props) {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const { data } = useQuery({
        queryKey: ["suppliers"],
        queryFn: getSuppliers,
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ...initialPrice,
            weight: initialPrice?.weight || undefined,
            supplierId: initialPrice?.supplierId || undefined,
        } || {
            supplierId: "",
            unit: "",
            price: 0,
            amount: 0,
            weight: 0,
        },
    });

    const router = useRouter();
    const unit = form.watch("unit");

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsOpen(false);
        let response;

        if (initialPrice) {
            response = axios.patch(`/api/deliveryPrice/${initialPrice.id}`, {
                ...values,
                ingredientId: initialPrice.ingredientId,
            });
        } else {
            response = axios.post("/api/deliveryPrice", {
                ...values,
                ingredientId,
            });
        }

        response.then(() => {
            router.refresh();
            form.reset();
        });

        toast.promise(response, {
            loading: "Loading...",
            success: () => {
                return `Price has been ${initialPrice ? "updated" : "added"}`;
            },
            error: "Error",
        });
    }

    const labelStyle = "after:content-['*'] after:text-red-500 after:ml-0.5";
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="w-[250px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold">
                        {initialPrice ? "Update" : "Add"} Price
                    </DialogTitle>
                    {!initialPrice && (
                        <DialogDescription>
                            Add a new price to your ingredient
                        </DialogDescription>
                    )}
                </DialogHeader>
                <div>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="flex flex-col gap-3 mt-5">
                            <FormField
                                control={form.control}
                                name={`supplierId`}
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
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
                                                            "w-[200px] justify-between",
                                                            !field.value &&
                                                                "text-muted-foreground"
                                                        )}>
                                                        {field.value
                                                            ? data &&
                                                              data.find(
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
                                                        {data &&
                                                            data.map(
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
                            <div className="flex space-x-6">
                                <FormField
                                    control={form.control}
                                    name="unit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={labelStyle}>
                                                Unit
                                            </FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}>
                                                <FormControl>
                                                    <SelectTrigger className="w-[130px]">
                                                        <SelectValue
                                                            className="text-muted-foreground"
                                                            placeholder="Select a unit"
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {UNIT.map((unit) => (
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
                                {unit === "Piece" && (
                                    <FormField
                                        control={form.control}
                                        name="weight"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Weight per unit
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
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
                                )}
                            </div>
                            <div className="flex space-x-6">
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
                                            <FormLabel className={labelStyle}>
                                                Price
                                            </FormLabel>
                                            <FormControl>
                                                <Input
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
                            </div>
                            <div className="flex justify-end pt-5">
                                <Button className="rounded-lg" type="submit">
                                    {initialPrice ? "Update" : "Add"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
