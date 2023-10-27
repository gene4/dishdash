"use client";

import React, { useRef, useState } from "react";
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
import { Ingredient, Supplier } from "@prisma/client";
import { Button } from "../ui/button";
import { Plus, Trash2 } from "lucide-react";
import { RecipeIngredients } from "@/app/[locale]/recipes/[recipeId]/data-table";
import { toast } from "sonner";
import IngredientsCommandBox from "../ingredients-command-box";
import IngredientForm from "../ingredients/table/ingredient-form";

const recipeSchema = z.object({
    ingredients: z
        .array(
            z.object({
                id: z.string().min(1, { message: "Ingredient is required" }),
                amount: z.preprocess(
                    (a) => parseFloat(z.string().parse(a)),
                    z.number().optional()
                ),
            })
        )
        .nonempty({
            message: "Ingredients are required",
        }),
});

interface Props {
    initialRecipeIngredient?: RecipeIngredients;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    ingredients: Ingredient[];
    recipeId?: string;
    suppliers?: Supplier[];
}

export default function RecipeIngredientForm({
    isOpen,
    setIsOpen,
    ingredients,
    recipeId,
    initialRecipeIngredient,
    suppliers,
}: Props) {
    const [isIngredientFormOpen, setIsIngredientFormOpen] = useState(false);
    const submitRef = useRef<HTMLButtonElement>(null);

    const initialDefaultValue = {
        ingredients: [
            {
                id: initialRecipeIngredient?.id,
                amount: initialRecipeIngredient?.amount,
            },
        ],
    };

    const form = useForm<z.infer<typeof recipeSchema>>({
        resolver: zodResolver(recipeSchema),
        defaultValues: initialDefaultValue || {
            ingredients: [{ id: "", amount: 0 }],
        },
        mode: "onTouched",
    });

    const { fields, append, remove } = useFieldArray({
        name: "ingredients",
        control: form.control,
    });

    const router = useRouter();

    async function onSubmit(values: z.infer<typeof recipeSchema>) {
        setIsOpen(false);

        const response = initialRecipeIngredient
            ? axios.patch(
                  `/api/recipeIngredient/${initialRecipeIngredient.recipeIngredientId}`,
                  values
              )
            : axios.post(`/api/recipeIngredient`, {
                  ...values,
                  recipeId,
              });

        response.then(() => {
            router.refresh();
            form.reset();
        });

        toast.promise(response, {
            loading: "Loading...",
            success: () => {
                return `${
                    initialRecipeIngredient
                        ? "Ingredient wes updated."
                        : "Ingredients were added to the recipe."
                }`;
            },
            error: "Error",
        });
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={setIsOpen}>
            <DialogContent className="w-[250px]">
                <DialogHeader className="mb-5">
                    <DialogTitle>
                        {initialRecipeIngredient ? "Update" : "Add"} Ingredients
                    </DialogTitle>
                    {!initialRecipeIngredient && (
                        <DialogDescription>
                            Add a new ingredients to your recipe
                        </DialogDescription>
                    )}
                </DialogHeader>
                <Form {...form}>
                    <form
                        className="space-y-6"
                        onSubmit={form.handleSubmit(onSubmit)}>
                        <>
                            <ol className="min-h-3 p-1 space-y-3 rounded-lg list-decimal max-h-[400px] overflow-y-scroll">
                                {fields.length ? (
                                    fields.map((field, index) => (
                                        <li
                                            className="ml-4"
                                            key={field.id}>
                                            <div className="flex justify-between items-center ml-3">
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
                                                                    min={0}
                                                                    step={0.1}
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
                                                                            submitRef.current?.click();
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
                        </>
                        {!initialRecipeIngredient && (
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
                            <Button
                                ref={submitRef}
                                type="submit">
                                {initialRecipeIngredient ? "Update" : "Add"}
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
