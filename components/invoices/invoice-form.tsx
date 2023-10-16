"use client";

import React from "react";

import { useForm } from "react-hook-form";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { Supplier } from "@prisma/client";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@radix-ui/react-popover";
import { Button } from "../ui/button";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import { InvoiceT, statuses } from "@/app/[locale]/invoices/data-table";

const MAX_FILE_SIZE = 500000;
const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
];

const recipeSchema = z.object({
    invoiceNr: z.string().min(1, { message: "Invoice number is required" }),
    supplierId: z.string().min(1, { message: "Supplier is required" }),
    date: z.date({ required_error: "Date is required" }),
    amount: z.coerce.number({ required_error: "Amount is required" }),
    status: z.string(),
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
    initialInvoice?: InvoiceT;
    suppliers: Supplier[];
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export default function InvoiceForm({
    isOpen,
    setIsOpen,
    suppliers,
    initialInvoice,
}: Props) {
    const form = useForm<z.infer<typeof recipeSchema>>({
        resolver: zodResolver(recipeSchema),
        defaultValues: initialInvoice || {
            invoiceNr: "",
            supplierId: "",
            status: "open",
            date: undefined,
            amount: 0,
            file: undefined,
        },
    });

    const { toast } = useToast();
    const router = useRouter();
    const isLoading = form.formState.isSubmitting;

    async function onSubmit(values: z.infer<typeof recipeSchema>) {
        try {
            const formData = new FormData();

            values.file && formData.append("file", values.file[0]);
            formData.append("invoiceNr", values.invoiceNr);
            formData.append("supplierId", values.supplierId);
            formData.append("amount", values.amount.toString());
            formData.append("date", values.date.toString());
            formData.append("status", values.status.toString());

            if (initialInvoice && initialInvoice.fileRef) {
                formData.append("fileUrl", initialInvoice.fileUrl!);
                formData.append("fileRef", initialInvoice.fileRef);
            }

            initialInvoice
                ? await axios.patch(
                      `/api/invoice/${initialInvoice.id}`,
                      formData
                  )
                : await axios.post("/api/invoice", formData);

            setIsOpen(false);
            toast({
                description: `Invoice was ${
                    initialInvoice ? "updated" : "added"
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
                    <DialogTitle>Add Invoice</DialogTitle>
                    <DialogDescription>
                        Add a new invoice to your list
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-7">
                        <div className="flex items-center space-x-6">
                            <FormField
                                control={form.control}
                                name="invoiceNr"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelStyle}>
                                            Invoice number
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
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelStyle}>
                                            Amount
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
                        <div className="flex space-x-6">
                            <FormField
                                control={form.control}
                                name={`supplierId`}
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className={labelStyle}>
                                            Supplier
                                        </FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
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
                                                            ? suppliers.find(
                                                                  (supplier) =>
                                                                      supplier.id ===
                                                                      field.value
                                                              )?.name
                                                            : "Select supplier"}
                                                        <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[200px] relative z-50 bg-background border rounded-md shadow-md">
                                                <Command>
                                                    <CommandInput placeholder="Search supplier..." />
                                                    <CommandEmpty>
                                                        No supplier found.
                                                    </CommandEmpty>
                                                    <CommandGroup>
                                                        {suppliers.map(
                                                            (supplier) => (
                                                                <CommandItem
                                                                    value={
                                                                        supplier.id
                                                                    }
                                                                    key={
                                                                        supplier.id
                                                                    }
                                                                    onSelect={() => {
                                                                        form.setValue(
                                                                            `supplierId`,
                                                                            supplier.id
                                                                        );
                                                                    }}>
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            supplier.id ===
                                                                                field.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {
                                                                        supplier.name
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
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className={labelStyle}>
                                            Date
                                        </FormLabel>
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
                                                                "PPP"
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
                        <div className="flex space-x-6">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelStyle}>
                                            Status
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-[150px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {statuses.map((status) => (
                                                    <SelectItem
                                                        key={status.value}
                                                        value={status.value}>
                                                        <span className="flex items-center">
                                                            {status.label}
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="file"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>PDF / Image</FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={isLoading}
                                                type="file"
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
                        <div className="flex justify-end pt-5">
                            <Button disabled={isLoading} type="submit">
                                {isLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {initialInvoice ? "Update" : "Add"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
