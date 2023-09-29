"use client";

import React, { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    Switch,
    cn,
} from "@nextui-org/react";
import { useFieldArray, useForm } from "react-hook-form";
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

import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";

import { Recipe, RecipeIngredient } from "@prisma/client";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@radix-ui/react-popover";

const recipeSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    unit: z.string().min(1, { message: "Unit is required" }),
    yield: z.coerce.number(),
    ingredients: z.array(
        z.object({
            id: z.string(),
            amount: z.coerce.number(),
        })
    ),
});

interface Props {
    initialRecipe: Recipe | null;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const languages = [
    { id: "English", amount: undefined },
    { id: "French", amount: undefined },
    { id: "German", amount: undefined },
    { id: "Spanish", amount: undefined },
] as const;

function RecipesForm({ initialRecipe, isOpen, setIsOpen }: Props) {
    const [isMultiple, setIsMultiple] = useState(false);

    const form = useForm<z.infer<typeof recipeSchema>>({
        resolver: zodResolver(recipeSchema),
        defaultValues: initialRecipe || {
            name: "",
            unit: "",
            yield: undefined,
            ingredients: undefined,
        },
    });

    const { fields, append } = useFieldArray({
        name: "ingredients",
        control: form.control,
    });

    const { toast } = useToast();
    const router = useRouter();
    const isLoading = form.formState.isSubmitting;

    async function onSubmit(values: z.infer<typeof recipeSchema>) {
        let response;

        try {
            if (initialRecipe) {
                response = await axios.patch(
                    `/api/ingredient/${initialRecipe.id}`,
                    values
                );
            } else {
                response = await axios.post("/api/ingredient", values);
            }

            toast({
                description: `${response.data.name} was ${
                    initialRecipe ? "updated" : "added"
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
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3 max-w-md">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={labelStyle}>Name</FormLabel>
                            <FormControl>
                                <Input disabled={isLoading} {...field} />
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
                            <FormLabel className={labelStyle}>Unit</FormLabel>
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
                                            <SelectItem key={unit} value={unit}>
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
                            <FormLabel className={labelStyle}>Yield</FormLabel>
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
                {/* {fields.map((field, index) => (
                                <FormField
                                    control={form.control}
                                    key={field.id}
                                    name={`ingredients.${index}.id`}
                                    render={({ field }) => (
                                        <>
                                            <FormItem className="flex flex-col">
                                                <FormLabel>
                                                    Ingredient
                                                </FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                role="combobox"
                                                                className={cn(
                                                                    "w-[200px] justify-between",
                                                                    !field.value &&
                                                                        "text-muted-foreground"
                                                                )}>
                                                                {field.value
                                                                    ? languages.find(
                                                                          (
                                                                              language
                                                                          ) =>
                                                                              language.id ===
                                                                              field.value
                                                                      )?.id
                                                                    : "Select language"}
                                                                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[200px] relative z-50 bg-background border rounded-md shadow-md">
                                                        <Command>
                                                            <CommandInput placeholder="Search language..." />
                                                            <CommandEmpty>
                                                                No language
                                                                found.
                                                            </CommandEmpty>
                                                            <CommandGroup>
                                                                {languages.map(
                                                                    (
                                                                        language
                                                                    ) => (
                                                                        <CommandItem
                                                                            value={
                                                                                language.id
                                                                            }
                                                                            key={
                                                                                language.id
                                                                            }
                                                                            // onSelect={() => {
                                                                            //     form.setValue(
                                                                            //         "ingredients",
                                                                            //         {
                                                                            //             id: language.id,
                                                                            //         }
                                                                            //     );
                                                                            // }}
                                                                        >
                                                                            <CheckIcon
                                                                                className={cn(
                                                                                    "mr-2 h-4 w-4",
                                                                                    language.id ===
                                                                                        field.value
                                                                                        ? "opacity-100"
                                                                                        : "opacity-0"
                                                                                )}
                                                                            />
                                                                            {
                                                                                language.id
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
                                            <FormItem></FormItem>
                                        </>
                                    )}
                                />
                            ))} */}

                {/* <Button
                                type="button"
                                size="sm"
                                className="mt-2"
                                onClick={() => append({ id: "", amount: 0 })}>
                                Add ingredient
                            </Button> */}
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
                        {initialRecipe ? "Update" : "Add"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

export default RecipesForm;
