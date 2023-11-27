"use client";

import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";

const recipeSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    paymentInfo: z.string().optional(),
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
    const formattedValues = {
        ...initialSupplier,
        paymentInfo: initialSupplier?.paymentInfo || undefined,
    };

    const form = useForm<z.infer<typeof recipeSchema>>({
        resolver: zodResolver(recipeSchema),
        defaultValues: formattedValues || {
            name: "",
            paymentInfo: "",
        },
    });

    const router = useRouter();

    async function onSubmit(values: z.infer<typeof recipeSchema>) {
        setIsOpen(false);

        const response = initialSupplier
            ? axios.patch(`/api/supplier/${initialSupplier.id}`, values)
            : axios.post("/api/supplier", values);

        toast.promise(response, {
            loading: "Loading...",
            success: () => {
                return `Supplier ${values.name} was ${
                    initialSupplier ? "updated" : "added"
                }`;
            },
            error: "Error",
        });

        response.then(() => {
            router.refresh();
            !initialSupplier && form.reset();
        });
    }

    const labelStyle = "after:content-['*'] after:text-red-500 after:ml-0.5";
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
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
                        <div className="flex justify-between space-x-7 items-center">
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
                        </div>
                        <FormField
                            control={form.control}
                            name="paymentInfo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment info</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="IBAN or address"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end pt-5">
                            <Button type="submit">
                                {initialSupplier ? "Update" : "Add"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
