"use client";

import React from "react";

import { useForm } from "react-hook-form";
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
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { RecipeIngredients } from "@/app/[locale]/recipes/[recipeId]/data-table";

const recipeSchema = z.object({
    amount: z.coerce.number({ required_error: "Amount is required" }),
});

interface Props {
    recipeIngredient: RecipeIngredients;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

function EditRecipeIngredientForm({
    recipeIngredient,
    isOpen,
    setIsOpen,
}: Props) {
    const form = useForm<z.infer<typeof recipeSchema>>({
        resolver: zodResolver(recipeSchema),
        defaultValues: recipeIngredient,
    });

    const { toast } = useToast();
    const router = useRouter();
    const isLoading = form.formState.isSubmitting;

    async function onSubmit(values: z.infer<typeof recipeSchema>) {
        let response;

        try {
            response = await axios.patch(
                `/api/recipeIngredient/${recipeIngredient.recipeIngredientId}`,
                values
            );
            setIsOpen(false);
            toast({
                description: `${recipeIngredient.name} was updated`,
                duration: 3000,
            });
            form.reset();
            router.refresh();
        } catch (error) {
            setIsOpen(false);
            toast({
                variant: "danger",
                description: "Something went wrong.",
                duration: 3000,
            });
        }
    }
    console.log("recipeIngredient", recipeIngredient);

    const labelStyle = "after:content-['*'] after:text-red-500 after:ml-0.5";
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="w-[250px]">
                <DialogHeader className="mb-5">
                    <DialogTitle>{recipeIngredient.name}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6">
                        <div className="flex justify-between space-x-4">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelStyle}>
                                            amount
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
                        <div className="flex justify-end pt-5">
                            <Button disabled={isLoading} type="submit">
                                {isLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Update
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default EditRecipeIngredientForm;
