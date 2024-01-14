"use client";

import React, { useState } from "react";

import { useForm } from "react-hook-form";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Delivery, DeliveryPrice } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import IngredientsCommandBox from "../ingredients-command-box";
import { IngredientPriceForm } from "../ingredients/table/ingredient-price-form";
import { useQuery } from "@tanstack/react-query";
import { getIngredients } from "@/lib/actions";

const formSchema = z.object({
    ingredientId: z.string().min(1, { message: "Ingredient is required" }),
    unit: z.string().min(1, { message: "Unit is required" }),
    amount: z.coerce.number().positive({ message: "Amount is required" }),
    weight: z.coerce.number().nullish(),
    price: z.coerce.number().positive({ message: "Price is required" }),
});

interface Props {
    initialItem?: DeliveryPrice;
    setIsOpen: (open: boolean) => void;
    isOpen: boolean;
    initialDelivery?: Delivery;
}

export default function ItemForm({
    initialItem,
    setIsOpen,
    isOpen,
    initialDelivery,
}: Props) {
    const [isIngredientFormOpen, setIsIngredientFormOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialItem || {
            ingredientId: "",
            unit: "",
            price: 0,
            amount: 0,
            weight: 0,
        },
    });

    const router = useRouter();

    const ingredients = useQuery({
        queryKey: ["ingredients"],
        queryFn: getIngredients,
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        let response;
        setIsOpen(false);
        if (initialItem) {
            response = axios.patch(`/api/deliveryPrice/${initialItem.id}`, {
                ...values,
                deliveryId: initialItem.deliveryId,
                supplierId: initialItem.supplierId,
            });
        } else {
            response = axios.post("/api/deliveryPrice", {
                ...values,
                deliveryId: initialDelivery?.id,
                supplierId: initialDelivery?.supplierId,
            });
        }

        response.then(() => {
            router.refresh();
            form.reset();
        });

        toast.promise(response, {
            loading: "Loading...",
            success: () => {
                return `Item has been ${initialItem ? "updated" : "added"}`;
            },
            error: "Error",
        });
    }

    const labelStyle = "after:content-['*'] after:text-red-500 after:ml-0.5";
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {initialItem ? "Edit" : "Add"} Item
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="space-y-4 my-4">
                            <div className="space-y-4 md:flex md:space-x-4 md:space-y-0">
                                <FormField
                                    control={form.control}
                                    name={`ingredientId`}
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col justify-end">
                                            <FormLabel className={labelStyle}>
                                                Item
                                            </FormLabel>
                                            <IngredientsCommandBox
                                                field={field}
                                                index={0}
                                                ingredients={ingredients.data}
                                                setValue={form.setValue}
                                                setIsIngredientFormOpen={
                                                    setIsIngredientFormOpen
                                                }
                                            />
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
                                                value={field.value}
                                                onValueChange={field.onChange}>
                                                <FormControl>
                                                    <SelectTrigger className="w-[120px]">
                                                        <SelectValue
                                                            className="text-muted-foreground"
                                                            placeholder="Select"
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
                            </div>
                            <div className="flex space-x-4">
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
                                                    className="w-[100px]"
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
                                                    className="w-[100px]"
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
                        </div>
                        <div className="w-full flex mt-8">
                            <Button
                                className="rounded-lg ml-auto"
                                type="submit">
                                {initialItem ? "Update" : "Add"}
                            </Button>
                        </div>
                    </form>
                </Form>
                <IngredientPriceForm
                    isOpen={isIngredientFormOpen}
                    setIsOpen={setIsIngredientFormOpen}
                />
            </DialogContent>
        </Dialog>
    );
}
