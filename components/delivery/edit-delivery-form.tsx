"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/config/constants";
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@radix-ui/react-popover";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Delivery } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IngredientPriceForm } from "../ingredients/table/ingredient-price-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";

const deliverySchema = z.object({
    invoiceNr: z.string().optional(),
    date: z.date({ required_error: "Date is required" }),
    file: z
        .any()
        .refine(
            (files) => files?.[0]?.size <= MAX_FILE_SIZE,
            `Max file size is 5MB.`
        )
        .refine(
            (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
            ".jpg, .jpeg, .png and .pdf files are accepted."
        )
        .optional(),
});

interface Props {
    setIsOpen: (open: boolean) => void;
    isOpen: boolean;
    initialDelivery: Delivery;
}

export default function EditDeliveryForm({
    setIsOpen,
    isOpen,
    initialDelivery,
}: Props) {
    const [isIngredientFormOpen, setIsIngredientFormOpen] = useState(false);
    const [isDateWindow, setIsDateWindow] = useState(false);

    const form = useForm<z.infer<typeof deliverySchema>>({
        resolver: zodResolver(deliverySchema),
        defaultValues: {
            ...initialDelivery,
            invoiceNr: initialDelivery?.invoiceNr || undefined,
        },
    });

    const router = useRouter();

    async function onSubmit(values: z.infer<typeof deliverySchema>) {
        setIsOpen(false);
        const formData = new FormData();

        values.file && formData.append("file", values.file[0]);
        values.invoiceNr && formData.append("invoiceNr", values.invoiceNr);
        formData.append("supplierId", initialDelivery.supplierId);
        formData.append("date", values.date.toString());

        if (initialDelivery && initialDelivery.fileRef) {
            formData.append("fileUrl", initialDelivery.fileUrl!);
            formData.append("fileRef", initialDelivery.fileRef);
        }

        const response = axios.patch(
            `/api/delivery/${initialDelivery.id}`,
            formData
        );

        response.then(() => {
            router.refresh();
            form.reset();
        });

        toast.promise(response, {
            loading: "Loading...",
            success: () => {
                return `Delivery has been updated`;
            },
            error: "Error",
        });
    }

    const labelStyle = "after:content-['*'] after:text-red-500 after:ml-0.5";
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Delivery</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="space-y-4 md:flex md:space-x-4 md:space-y-0 my-4">
                            <div className="flex flex-wrap space-y-4">
                                <FormField
                                    control={form.control}
                                    name="invoiceNr"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Invoice number
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="w-[250px]"
                                                    {...field}
                                                />
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col justify-end">
                                            <FormLabel className={labelStyle}>
                                                Date
                                            </FormLabel>
                                            <Popover
                                                open={isDateWindow}
                                                onOpenChange={setIsDateWindow}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-[250px] pl-3 text-left font-normal",
                                                                !field.value &&
                                                                    "text-muted-foreground"
                                                            )}>
                                                            {field.value ? (
                                                                format(
                                                                    field.value,
                                                                    "dd/MM/yyyy"
                                                                )
                                                            ) : (
                                                                <span>
                                                                    Pick a date
                                                                </span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="w-auto p-0 bg-background border shadow-md rounded-md"
                                                    align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={(event) => {
                                                            setIsDateWindow(
                                                                false
                                                            );
                                                            field.onChange(
                                                                event
                                                            );
                                                        }}
                                                        disabled={(date) =>
                                                            date > new Date() ||
                                                            date <
                                                                new Date(
                                                                    "1900-01-01"
                                                                )
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div>
                                <FormField
                                    control={form.control}
                                    name="file"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>PDF / Image</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="file"
                                                    className="w-[250px]"
                                                    accept=".jpg, .jpeg, .png, .pdf"
                                                    onChange={(event) =>
                                                        field.onChange(
                                                            event.target.files
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="w-full flex mt-8">
                            <Button
                                className="rounded-lg ml-auto"
                                type="submit">
                                Update
                            </Button>
                        </div>
                    </form>
                </Form>
                <IngredientPriceForm
                    isOpen={isIngredientFormOpen}
                    setIsOpen={setIsIngredientFormOpen}
                />
            </DialogContent>
        </Dialog>
    );
}
