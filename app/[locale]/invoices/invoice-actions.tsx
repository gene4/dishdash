"use client";

import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit, Trash2, FileText } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { InvoiceT } from "./data-table";
import InvoiceForm from "@/components/invoices/invoice-form";
import { Invoice, Supplier } from "@prisma/client";
import { toast } from "sonner";

interface Props {
    invoice: Invoice;
    suppliers: Supplier[];
}

export default function InvoiceActions({ invoice, suppliers }: Props) {
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);

    const router = useRouter();

    const onDelete = useCallback(async () => {
        setOpenDialog(false);

        const response = axios.delete(`/api/invoice/${invoice.id}`).then(() => {
            router.refresh();
        });

        toast.promise(response, {
            loading: "Loading...",
            success: () => {
                return `Invoice was deleted.`;
            },
            error: "Error",
        });
    }, [invoice.id, router]);

    return (
        <>
            <div className="flex justify-end w-[75px] space-x-3">
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
                            onClick={onDelete}
                            className="bg-red-500 hover:bg-red-500/90">
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
