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
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Supplier } from "@prisma/client";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

const recipeSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
});

interface Props {
    initialSupplier?: Supplier;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export default function SupplierForm({
    isOpen,
    setIsOpen,
    initialSupplier,
}: Props) {
    const form = useForm<z.infer<typeof recipeSchema>>({
        resolver: zodResolver(recipeSchema),
        defaultValues: initialSupplier || {
            name: "",
        },
    });

    const { toast } = useToast();
    const router = useRouter();
    const isLoading = form.formState.isSubmitting;

    async function onSubmit(values: z.infer<typeof recipeSchema>) {
        try {
            initialSupplier
                ? await axios.patch(
                      `/api/supplier/${initialSupplier.id}`,
                      values
                  )
                : await axios.post("/api/supplier", values);

            setIsOpen(false);
            toast({
                description: `Supplier ${values.name} was ${
                    initialSupplier ? "updated" : "added"
                }`,
                duration: 3000,
            });
            form.reset();
            router.refresh();
        } catch (error) {
            console.log(error);

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
                    <DialogTitle>Add Supplier</DialogTitle>
                    <DialogDescription>
                        Add a new supplier to your list
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-7">
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

                        <div className="flex justify-end pt-5">
                            <Button disabled={isLoading} type="submit">
                                {isLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {initialSupplier ? "Update" : "Add"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
