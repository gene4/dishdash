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
import { Button } from "../ui/button";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getIngredients, getRecipes } from "@/lib/actions";
import { Dish, DishIngredient } from "@prisma/client";
import IngredientsCommandBox from "../ingredients-command-box";
import { IngredientPriceForm } from "../ingredients/table/ingredient-price-form";

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
    initialDishIngredient?: DishIngredient;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    initialDish: Dish & { ingredients: DishIngredient[] };
}

export default function DishIngredientForm({
    isOpen,
    setIsOpen,
    initialDish,
    initialDishIngredient,
}: Props) {
    const [isIngredientFormOpen, setIsIngredientFormOpen] = useState(false);
    const submitRef = useRef<HTMLButtonElement>(null);

    const initialDefaultValue = {
        ingredients: [
            {
                ...initialDishIngredient,
                id:
                    initialDishIngredient?.recipeIngredientId ||
                    initialDishIngredient?.ingredientId ||
                    undefined,
                type: initialDishIngredient?.recipeIngredientId
                    ? "recipe"
                    : "ingredient",
            },
        ],
    };
    const form = useForm<z.infer<typeof recipeSchema>>({
        resolver: zodResolver(recipeSchema),
        defaultValues: initialDefaultValue || {
            ingredients: [{ id: "", amount: 0, type: "" }],
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

    const router = useRouter();

    async function onSubmit(values: z.infer<typeof recipeSchema>) {
        setIsOpen(false);

        const response = initialDishIngredient
            ? axios.patch(
                  `/api/dishIngredient/${initialDishIngredient.id}`,
                  values
              )
            : axios.post(`/api/dishIngredient`, {
                  ...values,
                  dishId: initialDish.id,
              });

        response.then(() => {
            router.refresh();
            form.reset();
        });

        toast.promise(response, {
            loading: "Loading...",
            success: () => {
                return `${
                    initialDishIngredient
                        ? "Ingredient wes updated."
                        : "Ingredients were added to the dish."
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
                        {initialDishIngredient ? "Update" : "Add"} Ingredients
                    </DialogTitle>
                    {!initialDishIngredient && (
                        <DialogDescription>
                            Add a new ingredients to your dish
                        </DialogDescription>
                    )}
                </DialogHeader>
                <Form {...form}>
                    <form
                        className="space-y-6"
                        onSubmit={form.handleSubmit(onSubmit)}>
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
                                                                ...recipes.data,
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
                                                onClick={() => remove(index)}
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
                        {!initialDishIngredient && (
                            <>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={"outline"}
                                    className="rounded-lg"
                                    onClick={() =>
                                        append({ id: "", amount: 0, type: "" })
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
                                {initialDishIngredient ? "Update" : "Add"}
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
