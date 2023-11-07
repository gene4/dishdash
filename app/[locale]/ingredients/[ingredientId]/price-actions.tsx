"use client";

import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { DeliveryPrice } from "@prisma/client";
import { Edit, Trash2, Star } from "lucide-react";
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
import { Row } from "@tanstack/react-table";
import { toast } from "sonner";
import PriceForm from "@/components/ingredients/table/price-form";
import { Toggle } from "@/components/ui/toggle";

export default function PriceActions({
    row,
    selectedPriceId,
}: {
    row: Row<DeliveryPrice>;
    selectedPriceId: string | null;
}) {
    const deliveryPrice = row.original;

    const [openDialog, setOpenDialog] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const isPriceSelected = selectedPriceId === deliveryPrice.id;

    const router = useRouter();

    const onDelete = useCallback(async () => {
        setOpenDialog(false);

        const response = axios
            .delete(`/api/deliveryPrice/${deliveryPrice.id}`)
            .then(() => {
                router.refresh();
            });

        toast.promise(response, {
            loading: "Loading...",
            success: () => {
                return `Price was deleted.`;
            },
            error: "Error",
        });
    }, [deliveryPrice.id, router]);

    const onToggleChange = useCallback(
        async (isPriceSelected: boolean) => {
            const selectedDeliveryPriceId = isPriceSelected
                ? null
                : deliveryPrice.id;

            const response = axios
                .patch(
                    `/api/ingredient/${deliveryPrice.ingredientId}/selectedPrice`,
                    { selectedDeliveryPriceId }
                )
                .then(() => {
                    router.refresh();
                });

            toast.promise(response, {
                loading: "Loading...",
                success: () => {
                    return "Selected price has been updated.";
                },
                error: "Error",
            });
        },
        [deliveryPrice.id, deliveryPrice.ingredientId, router]
    );

    return (
        <>
            <div className="flex space-x-2">
                <Toggle
                    pressed={isPriceSelected}
                    onPressedChange={() => onToggleChange(isPriceSelected)}
                    aria-label="Toggle selected price">
                    <Star className="h-4 w-4" />
                </Toggle>

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
                            <p>Edit ingredient</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <Trash2
                                onClick={() => setOpenDialog(true)}
                                className="w-4 h-4 text-red-500 hover:scale-110 transition-all"
                            />
                        </TooltipTrigger>
                        <TooltipContent className="bg-red-600 text-white rounded-3xl">
                            <p>Delete price</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <PriceForm
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
                initialPrice={deliveryPrice}
            />
            <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove this price from this ingredient.
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
        </>
    );
}
