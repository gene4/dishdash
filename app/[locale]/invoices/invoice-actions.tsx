"use client";

import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit, Loader2, Trash2, FileText } from "lucide-react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { InvoiceT } from "./data-table";
import InvoiceForm from "@/components/invoices/invoice-form";
import { Supplier } from "@prisma/client";

interface Props {
    invoice: InvoiceT;
    suppliers: Supplier[];
}

export default function InvoiceActions({ invoice, suppliers }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);

    const { toast } = useToast();
    const router = useRouter();

    const onDelete = useCallback(async () => {
        setIsLoading(true);
        try {
            await axios.delete(`/api/invoice/${invoice.id}`);
            setOpenDialog(false);
            setIsLoading(false);
            toast({
                description: `Invoice was deleted.`,
            });
            router.refresh();
        } catch (error) {
            setIsLoading(false);
            setOpenDialog(false);
            toast({
                variant: "danger",
                description: "Something went wrong.",
            });
        }
    }, [invoice.id, router, toast]);

    return (
        <>
            <div className="flex space-x-3 w-fit">
                {invoice.fileUrl && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <a target="_blank" href={invoice.fileUrl}>
                                    <FileText className="h-4 w-4 text-muted-foreground hover:scale-110 transition-all" />
                                </a>
                            </TooltipTrigger>
                            <TooltipContent className="bg-primary text-white rounded-3xl">
                                <p>Open file</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Edit
                                onClick={() => setIsEditFormOpen(true)}
                                className="w-4 h-4 text-muted-foreground cursor-pointer hover:scale-110 transition-all"
                            />
                        </TooltipTrigger>
                        <TooltipContent className="bg-muted text-foreground rounded-3xl">
                            <p>Edit invoice</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Trash2
                                onClick={() => setOpenDialog(true)}
                                className="w-4 h-4 text-red-500 cursor-pointer hover:scale-110 transition-all"
                            />
                        </TooltipTrigger>
                        <TooltipContent className="bg-red-600 text-white rounded-3xl ">
                            <p>Delete invoice</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will delete this invoice permanently.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>

                        <Button
                            disabled={isLoading}
                            onClick={onDelete}
                            className="bg-red-500 hover:bg-red-500/90">
                            {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <InvoiceForm
                suppliers={suppliers}
                isOpen={isEditFormOpen}
                setIsOpen={setIsEditFormOpen}
                initialInvoice={invoice}
            />
        </>
    );
}
