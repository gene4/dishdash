"use client";

import React, { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import IngredientsCommandBox from "../ingredients-command-box";
import { useQuery } from "@tanstack/react-query";
import { getIngredients, getRecipes } from "@/lib/actions";
import { IngredientPriceForm } from "../ingredients/table/ingredient-price-form";

const recipeSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    unit: z.string().min(1, { message: "Unit is required" }),
    yield: z.coerce.number({ required_error: "Yield is required" }),
    ingredients: z.array(
        z.object({
            id: z.string().min(1, { message: "Ingredients are required" }),
            type: z.string(),
            unit: z.string(),
            amount: z.coerce.number(),
        })
    ),
});

export default function CreateRecipeForm() {
    const [isIngredientFormOpen, setIsIngredientFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof recipeSchema>>({
        resolver: zodResolver(recipeSchema),
        defaultValues: {
            name: "",
            unit: "Kg",
            yield: 0,
            ingredients: [{ id: "", type: "", unit: "Kg", amount: 0 }],
        },
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
        const formattedValues = { ...values, recipeYield: values.yield };
        setIsLoading(true);

        const response = axios.post("/api/recipe", formattedValues);

        response
            .then(({ data }) => {
                router.refresh();
                form.reset();
                router.push(`/recipes/${data.id}`);
            })
            .finally(() => {
                setIsLoading(false);
            });

        toast.promise(response, {
            loading: "Loading...",
            success: () => {
                return `${values.name}  has been added`;
            },
            error: "Error",
        });
    }

    const labelStyle = "after:content-['*'] after:text-red-500 after:ml-0.5";
    return (
        <>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6">
                    <div className="flex space-x-4">
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
                                            className="w-32 md:w-36"
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
                                            value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-24">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="w-24">
                                                {UNIT.map((unit) => (
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
                                        Yield{" "}
                                        <span className="text-xs">(Kg)</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isLoading}
                                            className="w-16 md:w-20"
                                            type="number"
                                            min={0}
                                            step={0.001}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="border relative rounded-lg max-h-[380px] md:max-h-none overflow-scroll">
                        <Table>
                            <TableHeader className="shadow-sm sticky z-50 top-0 bg-background">
                                <TableRow className="">
                                    <TableHead>INGREDIENT</TableHead>
                                    <TableHead>UNIT</TableHead>
                                    <TableHead>AMOUNT</TableHead>
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody className="mt-5">
                                {fields.map((field, index) => (
                                    <TableRow key={field.id}>
                                        <TableCell>
                                            <FormField
                                                control={form.control}
                                                name={`ingredients.${index}.id`}
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <IngredientsCommandBox
                                                            field={field}
                                                            index={index}
                                                            ingredients={[
                                                                ...ingredients.data!,
                                                                ...recipes.data!,
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
                                        </TableCell>
                                        <TableCell>
                                            <FormField
                                                control={form.control}
                                                name={`ingredients.${index}.unit`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormControl>
                                                            <Select
                                                                onValueChange={
                                                                    field.onChange
                                                                }
                                                                value={
                                                                    field.value
                                                                }>
                                                                <FormControl>
                                                                    <SelectTrigger className="rounded-lg w-20 md:w-24">
                                                                        <SelectValue placeholder="Select" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {UNIT.map(
                                                                        (
                                                                            unit
                                                                        ) => (
                                                                            <SelectItem
                                                                                key={
                                                                                    unit
                                                                                }
                                                                                value={
                                                                                    unit
                                                                                }>
                                                                                {
                                                                                    unit
                                                                                }
                                                                            </SelectItem>
                                                                        )
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FormField
                                                control={form.control}
                                                name={`ingredients.${index}.amount`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                className="w-16 md:w-20"
                                                                type="number"
                                                                step={0.001}
                                                                min={0}
                                                                autoFocus={
                                                                    false
                                                                }
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
                                        </TableCell>

                                        <TableCell>
                                            <Button
                                                className="rounded-full"
                                                onClick={() => remove(index)}
                                                size="icon"
                                                variant="ghost">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <>
                        <Button
                            type="button"
                            size="sm"
                            defaultValue={undefined}
                            variant={"secondary"}
                            className="rounded-lg border"
                            onClick={() =>
                                append({
                                    id: "",
                                    type: "",
                                    unit: "Kg",
                                    amount: 0,
                                })
                            }>
                            <Plus className="mr-2 w-4 h-4" /> Add ingredient
                        </Button>
                        <p className="text-red-500 text-sm mt-2">
                            {form.formState.errors.ingredients?.message}
                        </p>
                    </>

                    <div className="flex justify-end pt-5">
                        <Button disabled={isLoading} type="submit">
                            Create
                        </Button>
                    </div>
                </form>
            </Form>

            <IngredientPriceForm
                isOpen={isIngredientFormOpen}
                setIsOpen={setIsIngredientFormOpen}
            />
        </>
    );
}
