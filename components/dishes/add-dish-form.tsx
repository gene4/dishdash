"use client";

import React from "react";

import { useFieldArray, useForm } from "react-hook-form";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
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

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";

import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@radix-ui/react-popover";
import { Button } from "../ui/button";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { IngredientsAndRecipes } from "@/app/[locale]/dishes/data-table";

const recipeSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    multiplier: z.coerce.number({ required_error: "Multiplier is required" }),
    targetPrice: z.coerce.number({ required_error: "Targe price is required" }),
    ingredients: z
        .array(
            z.object({
                id: z.string().min(1, { message: "Name is required" }),
                type: z.string(),
                amount: z.coerce.number(),
            })
        )
        .nonempty({
            message: "Ingredients are required",
        }),
});

interface Props {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    ingredientsAndRecipes: IngredientsAndRecipes;
}

function AddDishForm({ isOpen, setIsOpen, ingredientsAndRecipes }: Props) {
    const form = useForm<z.infer<typeof recipeSchema>>({
        resolver: zodResolver(recipeSchema),
        defaultValues: {
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

    const { toast } = useToast();
    const router = useRouter();
    const isLoading = form.formState.isSubmitting;

    async function onSubmit(values: z.infer<typeof recipeSchema>) {
        try {
            const response = await axios.post("/api/dish", values);
            setIsOpen(false);
            toast({
                description: `${response.data.name} was added.`,
                duration: 3000,
            });
            form.reset();
            router.refresh();
        } catch (error) {
            toast({
                variant: "danger",
                description: "Something went wrong.",
                duration: 3000,
            });
        }
    }

    const labelStyle = "after:content-['*'] after:text-red-500 after:ml-0.5";
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="w-[250px]">
                <DialogHeader className="mb-5">
                    <DialogTitle>Add Dish</DialogTitle>
                    <DialogDescription>
                        {" "}
                        Add a new dish to your list
                    </DialogDescription>
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
                                name="targetPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelStyle}>
                                            Target price
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
                                name="multiplier"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelStyle}>
                                            Multiplier
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
                        </div>
                        <ol className="border p-4 min-h-3 space-y-3 rounded-lg list-decimal max-h-[400px] overflow-y-scroll">
                            {fields.length ? (
                                fields.map((field, index) => (
                                    <li className="ml-4" key={field.id}>
                                        <div className="flex justify-between items-center ml-3">
                                            <FormField
                                                control={form.control}
                                                name={`ingredients.${index}.id`}
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <Popover>
                                                            <PopoverTrigger
                                                                asChild>
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
                                                                            ? ingredientsAndRecipes.find(
                                                                                  (
                                                                                      ingredient
                                                                                  ) =>
                                                                                      ingredient.id ===
                                                                                      field.value
                                                                              )
                                                                                  ?.name
                                                                            : "Select ingredient"}
                                                                        <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-[200px] relative z-50 bg-background border rounded-md shadow-md">
                                                                <Command>
                                                                    <CommandInput placeholder="Search ingredient..." />
                                                                    <CommandEmpty>
                                                                        No
                                                                        ingredient
                                                                        found.
                                                                    </CommandEmpty>
                                                                    <CommandGroup>
                                                                        {ingredientsAndRecipes.map(
                                                                            (
                                                                                ingredient
                                                                            ) => (
                                                                                <CommandItem
                                                                                    value={
                                                                                        ingredient.name
                                                                                    }
                                                                                    key={
                                                                                        ingredient.id
                                                                                    }
                                                                                    onSelect={() => {
                                                                                        form.setValue(
                                                                                            `ingredients.${index}.id`,
                                                                                            ingredient.id
                                                                                        );
                                                                                        form.setValue(
                                                                                            `ingredients.${index}.type`,
                                                                                            "yield" in
                                                                                                ingredient
                                                                                                ? "recipe"
                                                                                                : "ingredient"
                                                                                        );
                                                                                    }}>
                                                                                    <CheckIcon
                                                                                        className={cn(
                                                                                            "mr-2 h-4 w-4",
                                                                                            ingredient.id ===
                                                                                                field.value
                                                                                                ? "opacity-100"
                                                                                                : "opacity-0"
                                                                                        )}
                                                                                    />
                                                                                    {
                                                                                        ingredient.name
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
                                            <FormField
                                                control={form.control}
                                                name={`ingredients.${index}.amount`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                disabled={
                                                                    isLoading
                                                                }
                                                                type="number"
                                                                step={0.1}
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
                        <div>
                            <Button
                                type="button"
                                size="sm"
                                defaultValue={undefined}
                                variant={"outline"}
                                className="rounded-lg"
                                onClick={() =>
                                    append({
                                        id: "",
                                        type: "",
                                        amount: 0,
                                    })
                                }>
                                <Plus className="mr-2 w-4 h-4" /> Add ingredient
                            </Button>
                            <p className="text-red-500 text-sm mt-2">
                                {form.formState.errors.ingredients?.message}
                            </p>
                        </div>
                        <div className="flex justify-end pt-5">
                            <Button disabled={isLoading} type="submit">
                                {isLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Add
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default AddDishForm;
