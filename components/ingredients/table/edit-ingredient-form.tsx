"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useFieldArray, useForm } from "react-hook-form";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { VAT } from "@/config/constants";
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
import { toast } from "sonner";
import { Ingredient } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    vat: z.string().min(1, { message: "Vat is required" }),
    category: z.string().min(1, { message: "Category is required" }),
    variants: z
        .array(
            z.object({
                id: z.string(),
                name: z.string(),
                wightPerPiece: z.coerce.number(),
            })
        )
        .optional(),
});

interface Props {
    initialIngredient: Ingredient;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export default function EditIngredientForm({
    initialIngredient,
    isOpen,
    setIsOpen,
}: Props) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialIngredient,
    });

    const router = useRouter();

    const { fields, append, remove } = useFieldArray({
        name: "variants",
        control: form.control,
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsOpen(false);
        const response = axios
            .patch(`/api/ingredient/${initialIngredient.id}`, values)
            .then(() => {
                router.refresh();
            });

        toast.promise(response, {
            loading: "Loading...",
            success: () => {
                return `${values.name}  has been ${
                    initialIngredient ? "updated" : "added"
                }`;
            },
            error: "Error",
        });
    }

    const labelStyle = "after:content-['*'] after:text-red-500 after:ml-0.5";
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader className="mb-5">
                    <DialogTitle>Edit ingredient</DialogTitle>
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
                                                className="w-28"
                                                {...field}
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="vat"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel className={labelStyle}>
                                            VAT
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
                                                    {VAT.map((vat) => (
                                                        <SelectItem
                                                            key={vat}
                                                            value={vat}>
                                                            {vat}
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
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelStyle}>
                                            Category
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <ol className="min-h-3 space-y-3 max-h-[300px] overflow-y-scroll">
                            {fields.map((field, index) => (
                                <li key={field.id}>
                                    <div className="flex items-end space-x-4 p-[1px]">
                                        <FormField
                                            control={form.control}
                                            name={`variants.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel
                                                        className={labelStyle}>
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
                                            name={`variants.${index}.wightPerPiece`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel
                                                        className={cn(
                                                            labelStyle,
                                                            "inline-block w-max"
                                                        )}>
                                                        Wight per piece (Kg)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step={0.01}
                                                            min={0}
                                                            autoFocus={false}
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
                            ))}
                        </ol>

                        <Button
                            type="button"
                            size="sm"
                            variant={"secondary"}
                            className="rounded-lg border w-fit"
                            onClick={() =>
                                append({ id: "", name: "", wightPerPiece: 0 })
                            }>
                            <Plus className="mr-2 w-4 h-4" /> Add variant
                        </Button>

                        <div className="flex justify-end pt-5">
                            <Button type="submit">Update</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
