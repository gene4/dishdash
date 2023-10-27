"use client";

import React, { useState } from "react";

import { useFieldArray, useForm } from "react-hook-form";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Plus, Trash2 } from "lucide-react";
import { IngredientsAndRecipes } from "@/app/[locale]/dishes/data-table";
import { Dish, Supplier } from "@prisma/client";
import { toast } from "sonner";
import IngredientsCommandBox from "../ingredients-command-box";
import IngredientForm from "../ingredients/table/ingredient-form";

const recipeSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    multiplier: z.coerce.number({ required_error: "Multiplier is required" }),
    targetPrice: z.coerce.number({ required_error: "Targe price is required" }),
    ingredients: z
        .array(
            z
                .object({
                    id: z.string().min(1, { message: "Name is required" }),
                    type: z.string(),
                    amount: z.coerce.number(),
                })
                .optional()
        )
        .optional(),
});

interface Props {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    ingredientsAndRecipes?: IngredientsAndRecipes;
    initialDish?: Dish;
    suppliers?: Supplier[];
}

export default function DishForm({
    isOpen,
    setIsOpen,
    ingredientsAndRecipes,
    initialDish,
    suppliers,
}: Props) {
    const [isIngredientFormOpen, setIsIngredientFormOpen] = useState(false);

    const form = useForm<z.infer<typeof recipeSchema>>({
        resolver: zodResolver(recipeSchema),
        defaultValues: initialDish || {
            name: "",
            targetPrice: 0,
            multiplier: 0,
            ingredients: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        name: "ingredients",
        control: form.control,
    });

    const router = useRouter();

    async function onSubmit(values: z.infer<typeof recipeSchema>) {
        setIsOpen(false);

        const response = initialDish
            ? axios.patch(`/api/dish/${initialDish.id}`, values)
            : axios.post("/api/dish", values);

        response.then(() => {
            router.refresh();
        });

        toast.promise(response, {
            loading: "Loading...",
            success: () => {
                return `${values.name}  has been ${
                    initialDish ? "updated" : "added"
                }`;
            },
            error: "Error",
        });
    }

    const labelStyle = "after:content-['*'] after:text-red-500 after:ml-0.5";
    return (
        <Dialog
            open={isOpen}
            onOpenChange={setIsOpen}>
            <DialogContent className="w-[250px]">
                <DialogHeader className="mb-5">
                    <DialogTitle>
                        {initialDish ? "Update" : "Add"} Dish
                    </DialogTitle>
                    {!initialDish && (
                        <DialogDescription>
                            Add a new dish to your list
                        </DialogDescription>
                    )}
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6">
                        <div className="flex justify-between space-x-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelStyle}>
                                            Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="targetPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelStyle}>
                                            Target price
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={0}
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
                                name="multiplier"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelStyle}>
                                            Multiplier
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={0}
                                                step={0.1}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        {ingredientsAndRecipes && (
                            <>
                                <ol className="border p-4 min-h-3 space-y-3 rounded-lg list-decimal max-h-[300px] overflow-y-scroll">
                                    {fields.length ? (
                                        fields.map((field, index) => (
                                            <li
                                                className="ml-6"
                                                key={field.id}>
                                                <div className="flex justify-between items-center space-x-4 ml-2">
                                                    <FormField
                                                        control={form.control}
                                                        name={`ingredients.${index}.id`}
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-col">
                                                                <IngredientsCommandBox
                                                                    field={
                                                                        field
                                                                    }
                                                                    index={
                                                                        index
                                                                    }
                                                                    ingredients={
                                                                        ingredientsAndRecipes
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
                                                    <FormField
                                                        control={form.control}
                                                        name={`ingredients.${index}.amount`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        min={0}
                                                                        step={
                                                                            0.1
                                                                        }
                                                                        autoFocus={
                                                                            false
                                                                        }
                                                                        placeholder="Amount"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <Button
                                                        className="rounded-full"
                                                        onClick={() =>
                                                            remove(index)
                                                        }
                                                        size="icon"
                                                        variant="ghost">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </li>
                                        ))
                                    ) : (
                                        <p className="text-center text-sm">
                                            No ingredients
                                        </p>
                                    )}
                                </ol>
                            </>
                        )}
                        {ingredientsAndRecipes && (
                            <>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={"outline"}
                                    className="rounded-lg"
                                    onClick={() =>
                                        append({
                                            id: "",
                                            type: "",
                                            amount: 0,
                                        })
                                    }>
                                    <Plus className="mr-2 w-4 h-4" /> Add
                                    ingredient
                                </Button>
                                <p className="text-red-500 text-sm mt-2">
                                    {form.formState.errors.ingredients?.message}
                                </p>
                            </>
                        )}
                        <div className="flex justify-end pt-5">
                            <Button type="submit">
                                {initialDish ? "Update" : "Add"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
            {suppliers && (
                <IngredientForm
                    isOpen={isIngredientFormOpen}
                    setIsOpen={setIsIngredientFormOpen}
                    suppliers={suppliers}
                />
            )}
        </Dialog>
    );
}
