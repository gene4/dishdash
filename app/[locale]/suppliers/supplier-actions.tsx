"use client";

import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Supplier } from "@prisma/client";
import { Edit, Loader2, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Row } from "@tanstack/react-table";
import SupplierForm from "@/components/suppliers/supplier-form";

interface Props {
    row: Row<Supplier>;
}

export default function SupplierActions({ row }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { toast } = useToast();
    const router = useRouter();

    const supplier = row.original;

    const onDelete = useCallback(async () => {
        setIsLoading(true);
        try {
            await axios.delete(`/api/supplier/${supplier.id}`);
            setOpenDialog(false);
            setIsLoading(false);
            toast({
                description: `Supplier ${supplier.name} was deleted.`,
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
    }, [router, supplier.id, supplier.name, toast]);

    return (
        <>
            <div className="flex space-x-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <Edit
                                onClick={() => {
                                    setIsFormOpen(true);
                                }}
                                className="w-4 h-4 text-muted-foreground hover:scale-110 transition-all"
                            />
                        </TooltipTrigger>
                        <TooltipContent className="bg-muted text-foreground rounded-3xl">
                            <p>Edit supplier</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogTrigger>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Trash2 className="w-4 h-4 text-red-500 hover:scale-110 transition-all" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-red-600 text-white rounded-3xl">
                                    <p>Delete supplier</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            <DialogDescription>
                                This supplier will be removed from recipes or
                                dishes where it might have been included.{" "}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button onClick={() => setOpenDialog(false)}>
                                Cancel
                            </Button>
                            <Button
                                disabled={isLoading}
                                onClick={onDelete}
                                className="bg-red-500 hover:bg-red-500/90">
                                {isLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <SupplierForm
                    isOpen={isFormOpen}
                    setIsOpen={setIsFormOpen}
                    initialSupplier={supplier}
                />
            </div>
        </>
    );
}
