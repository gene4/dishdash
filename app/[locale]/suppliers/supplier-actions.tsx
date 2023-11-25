"use client";

import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Supplier } from "@prisma/client";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";
import { useRouter } from "next/navigation";
import SupplierForm from "@/components/suppliers/supplier-form";
import { toast } from "sonner";

interface Props {
    supplier: Supplier;
}

export default function SupplierActions({ supplier }: Props) {
    const [openDialog, setOpenDialog] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const router = useRouter();

    const onDelete = useCallback(async () => {
        setOpenDialog(false);

        const response = axios
            .delete(`/api/supplier/${supplier.id}`)
            .then(() => {
                router.refresh();
                router.push("/suppliers");
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
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant={"outline"} size={"icon"}>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Supplier actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => {
                            setIsFormOpen(true);
                            document.body.style.pointerEvents = "";
                        }}
                        className="flex items-center justify-between">
                        Edit <Edit className="w-4 h-4" />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                            setOpenDialog(true);
                            document.body.style.pointerEvents = "";
                        }}
                        className="flex items-center justify-between text-red-500 focus:text-white focus:bg-red-500">
                        Delete <Trash2 className="w-4 h-4" />
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <SupplierForm
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
                initialSupplier={supplier}
            />
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This supplier will be removed from recipes or dishes
                            where it might have been included.{" "}
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
        </>
    );
}
