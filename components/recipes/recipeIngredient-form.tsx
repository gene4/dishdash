"use client";

import React, { useMemo, useRef, useState } from "react";
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
import { Ingredient, Recipe, RecipeIngredient, Supplier } from "@prisma/client";
import { Button } from "../ui/button";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import IngredientsCommandBox from "../ingredients-command-box";
import { IngredientPriceForm } from "../ingredients/table/ingredient-price-form";
import { useQuery } from "@tanstack/react-query";
import { getIngredients, getRecipes } from "@/lib/actions";

const recipeSchema = z.object({
    ingredients: z
        .array(
            z.object({
                id: z.string().min(1, { message: "Ingredient is required" }),
                type: z.string(),
                amount: z.coerce.number(),
            })
        )
        .nonempty({
            message: "Ingredients are required",
        }),
});

interface Props {
    initialRecipeIngredient?: RecipeIngredient;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    initialRecipe: Recipe & { ingredients: RecipeIngredient[] };
}

export default function RecipeIngredientForm({
    isOpen,
    setIsOpen,
    initialRecipe,
    initialRecipeIngredient,
}: Props) {
    const [isIngredientFormOpen, setIsIngredientFormOpen] = useState(false);
    const submitRef = useRef<HTMLButtonElement>(null);

    const router = useRouter();

    const initialDefaultValue = {
        ingredients: [
            {
                ...initialRecipeIngredient,
                id:
                    initialRecipeIngredient?.recipeIngredientId ||
                    initialRecipeIngredient?.ingredientId ||
                    undefined,
                type: initialRecipeIngredient?.recipeIngredientId
                    ? "recipe"
                    : "ingredient",
            },
        ],
    };

    const form = useForm<z.infer<typeof recipeSchema>>({
        resolver: zodResolver(recipeSchema),
        defaultValues: initialDefaultValue || {
            ingredients: [{ id: "", type: "", amount: 0 }],
        },
        mode: "onTouched",
    });

    const recipes = useQuery({
        queryKey: ["recipes"],
        queryFn: getRecipes,
    });
    const ingredients = useQuery({
        queryKey: ["ingredients"],
        queryFn: getIngredients,
    });

    const { fields, append, remove } = useFieldArray({
        name: "ingredients",
        control: form.control,
    });

    const filteredRecipes = useMemo(() => {
        if (!recipes.data) return [];

        const isRecipeExists = (recipe: any) =>
            recipe.ingredients.some(
                (item: any) =>
                    item.recipeIngredientId &&
                    (item.recipeIngredientId === initialRecipe.id ||
                        isRecipeExists(item.recipeIngredient))
            );
        // filter out any recipe that contains the initialRecipe as ingredient and the initialRecipe itself
        return recipes.data.filter(
            (recipe: any) =>
                !isRecipeExists(recipe) && recipe.id !== initialRecipe.id
        );
    }, [initialRecipe.id, recipes.data]);

    async function onSubmit(values: z.infer<typeof recipeSchema>) {
        setIsOpen(false);

        const response = initialRecipeIngredient
            ? axios.patch(
                  `/api/recipeIngredient/${initialRecipeIngredient.id}`,
                  values
              )
            : axios.post(`/api/recipeIngredient`, {
                  ...values,
                  recipeId: initialRecipe.id,
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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
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
                            <ol className="md:border md:p-4 min-h-3 py-1 space-y-3 md:rounded-lg md:list-decimal max-h-[300px] overflow-y-scroll">
                                {fields.length ? (
                                    fields.map((field, index) => (
                                        <li className="md:ml-6" key={field.id}>
                                            <div className="flex justify-between items-center space-x-4 md:ml-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`ingredients.${index}.id`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col">
                                                            <IngredientsCommandBox
                                                                field={field}
                                                                index={index}
                                                                ingredients={[
                                                                    ...filteredRecipes,
                                                                    ...ingredients.data,
                                                                ]}
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
                                                                    step={0.01}
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
                                        append({ id: "", type: "", amount: 0 })
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
                            <Button ref={submitRef} type="submit">
                                {initialRecipeIngredient ? "Update" : "Add"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
            <IngredientPriceForm
                isOpen={isIngredientFormOpen}
                setIsOpen={setIsIngredientFormOpen}
            />
        </Dialog>
    );
}
