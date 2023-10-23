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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@radix-ui/react-popover";
import { Supplier } from "@prisma/client";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { getNextPaymentDate } from "@/lib/utils/get-next-payment-date";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Textarea } from "../ui/textarea";

const recipeSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    paymentDay: z.date(),
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
    const form = useForm<z.infer<typeof recipeSchema>>({
        resolver: zodResolver(recipeSchema),
        defaultValues: {
            ...initialSupplier,
            paymentDay: initialSupplier?.paymentDay
                ? new Date(getNextPaymentDate(initialSupplier?.paymentDay))
                : undefined,
            paymentInfo: initialSupplier?.paymentInfo || undefined,
        } || {
            name: "",
            paymentInfo: "",
            paymentDay: undefined,
        },
    });

    const router = useRouter();

    async function onSubmit(values: z.infer<typeof recipeSchema>) {
        setIsOpen(false);
        const formattedValues = {
            ...values,
            paymentDay: values.paymentDay.getDate(),
        };

        const response = initialSupplier
            ? axios.patch(
                  `/api/supplier/${initialSupplier.id}`,
                  formattedValues
              )
            : axios.post("/api/supplier", formattedValues);

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

                            <FormField
                                control={form.control}
                                name="paymentDay"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Next payment date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-[240px] pl-3 text-left font-normal",
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
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>

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
