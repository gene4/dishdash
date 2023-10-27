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
import { Edit, Trash2, BarChart3 } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { Row } from "@tanstack/react-table";
import SupplierForm from "@/components/suppliers/supplier-form";
import { toast } from "sonner";

interface Props {
    row: Row<Supplier>;
}

export default function SupplierActions({ row }: Props) {
    const [openDialog, setOpenDialog] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const router = useRouter();
    const supplier = row.original;

    const onDelete = useCallback(async () => {
        setOpenDialog(false);

        const response = axios
            .delete(`/api/supplier/${supplier.id}`)
            .then(() => {
                router.refresh();
            });

        toast.promise(response, {
            loading: "Loading...",
            success: () => {
                return `Supplier ${supplier.name} was deleted.`;
            },
            error: "Error",
        });
    }, [router, supplier.id, supplier.name]);

    return (
        <>
            <div className="flex space-x-2">
                {/* <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <BarChart3
                                onClick={() =>
                                    router.push(`/suppliers/${supplier.id}`)
                                }
                                className="w-4 h-4 text-muted-foreground hover:scale-110 transition-all"
                            />
                        </TooltipTrigger>
                        <TooltipContent className="bg-muted text-foreground rounded-3xl">
                            <p>Overview</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider> */}
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

                <Dialog
                    open={openDialog}
                    onOpenChange={setOpenDialog}>
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
                                onClick={onDelete}
                                className="bg-red-500 hover:bg-red-500/90">
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
