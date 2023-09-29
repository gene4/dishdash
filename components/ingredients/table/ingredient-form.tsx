"use client";

import React, { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button, Switch } from "@nextui-org/react";
import { useForm } from "react-hook-form";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useToast } from "@/components/ui/use-toast";
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

import { Ingredient } from "@prisma/client";

const formSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    unit: z.string().min(1, { message: "Unit is required" }),
    price: z.coerce.number(),
    category: z.string().min(1, { message: "Category is required" }),
    supplier: z.string().min(1, { message: "Supplier is required" }),
});

interface Props {
    initialIngredient: Ingredient | null;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

function IngredientForm({ initialIngredient, isOpen, setIsOpen }: Props) {
    const [isMultiple, setIsMultiple] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialIngredient || {
            name: "",
            unit: "",
            price: undefined,
            category: "",
            supplier: "",
        },
    });
    const { toast } = useToast();
    const router = useRouter();
    const isLoading = form.formState.isSubmitting;
    console.log(initialIngredient);
    async function onSubmit(values: z.infer<typeof formSchema>) {
        let response;

        try {
            if (initialIngredient) {
                response = await axios.patch(
                    `/api/ingredient/${initialIngredient.id}`,
                    values
                );
            } else {
                response = await axios.post("/api/ingredient", values);
            }

            toast({
                description: `${response.data.name} was ${
                    initialIngredient ? "updated" : "added"
                }.`,
                duration: 3000,
            });
            form.reset();
            !isMultiple && setIsOpen(false);

            router.refresh();
        } catch (error) {
            toast({
                variant: "danger",
                description: "Something went wrong.",
                duration: 3000,
            });
        }
    }

    const labelStyle = "after:content-['*'] after:text-danger after:ml-0.5";
    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent side={"left"}>
                <SheetHeader>
                    <SheetTitle className="text-3xl font-semibold">
                        Add Ingredient
                    </SheetTitle>
                    <SheetDescription>
                        Add a new ingredient to your list
                    </SheetDescription>
                </SheetHeader>
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
                                            disabled={isLoading}
                                            {...field}
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
                                    <FormControl>
                                        <Select
                                            disabled={isLoading}
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="" />
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
                            name="supplier"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={labelStyle}>
                                        Supplier
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isLoading}
                                            {...field}
                                        />
                                    </FormControl>

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
                                            disabled={isLoading}
                                            {...field}
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-between pt-5">
                            <Switch
                                isSelected={isMultiple}
                                onValueChange={setIsMultiple}>
                                Add multiple
                            </Switch>
                            <Button
                                isLoading={isLoading}
                                radius="lg"
                                size="md"
                                color="primary"
                                type="submit">
                                {initialIngredient ? "Update" : "Add"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}

export default IngredientForm;
