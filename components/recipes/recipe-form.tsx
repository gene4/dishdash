"use client";

import React, { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Ingredient, Recipe, Supplier } from "@prisma/client";
import { Button } from "../ui/button";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import IngredientsCommandBox from "../ingredients-command-box";
import IngredientForm from "../ingredients/table/ingredient-form";

const recipeSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    unit: z.string().min(1, { message: "Unit is required" }),
    yield: z.coerce.number({ required_error: "Yield is required" }),
    ingredients: z
        .array(
            z.object({
                id: z.string().min(1, { message: "Ingredient is required" }),
                amount: z.coerce.number(),
            })
        )
        .optional(),
});

interface Props {
    initialRecipe?: Recipe;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    ingredients?: Ingredient[];
    suppliers?: Supplier[];
}

export default function RecipeForm({
    initialRecipe,
    isOpen,
    setIsOpen,
    ingredients,
    suppliers,
}: Props) {
    const [isIngredientFormOpen, setIsIngredientFormOpen] = useState(false);
    const form = useForm<z.infer<typeof recipeSchema>>({
        resolver: zodResolver(recipeSchema),
        defaultValues: initialRecipe || {
            name: "",
            unit: "",
            yield: 0,
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
        const formattedValues = { ...values, recipeYield: values.yield };

        const response = initialRecipe
            ? axios.patch(`/api/recipe/${initialRecipe.id}`, formattedValues)
            : axios.post("/api/recipe", formattedValues);

        response.then(() => {
            router.refresh();
        });

        toast.promise(response, {
            loading: "Loading...",
            success: () => {
                return `${values.name}  has been ${
                    initialRecipe ? "updated" : "added"
                }`;
            },
            error: "Error",
        });
    }

    const labelStyle = "after:content-['*'] after:text-red-500 after:ml-0.5";
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="w-[250px]">
                <DialogHeader className="mb-5">
                    <DialogTitle>
                        {initialRecipe ? "Update" : "Add"} Recipe
                    </DialogTitle>
                    {!initialRecipe && (
                        <DialogDescription>
                            Add a new recipe to your list
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
                                name="unit"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel className={labelStyle}>
                                            Unit
                                        </FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="rounded-lg">
                                                        <SelectValue placeholder="Select" />
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
                                name="yield"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelStyle}>
                                            Yield
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={0}
                                                step={0.01}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        {ingredients && (
                            <ol className="border p-4 min-h-3 space-y-3 rounded-lg list-decimal max-h-[300px] overflow-y-scroll">
                                {fields.length ? (
                                    fields.map((field, index) => (
                                        <li className="ml-6" key={field.id}>
                                            <div className="flex justify-between items-center space-x-4 ml-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`ingredients.${index}.id`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col">
                                                            <IngredientsCommandBox
                                                                field={field}
                                                                index={index}
                                                                ingredients={
                                                                    ingredients
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
                                                                    step={0.1}
                                                                    min={0}
                                                                    autoFocus={
                                                                        false
                                                                    }
                                                                    placeholder="Amount"
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
                        )}
                        {ingredients && (
                            <>
                                <Button
                                    type="button"
                                    size="sm"
                                    defaultValue={undefined}
                                    variant={"outline"}
                                    className="rounded-lg"
                                    onClick={() =>
                                        append({ id: "", amount: 0 })
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
                                {initialRecipe ? "Update" : "Add"}
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
