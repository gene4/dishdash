"use client";

import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit, Loader2, Trash2 } from "lucide-react";
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
import { DishIngredients } from "./data-table";
import EditDishIngredientForm from "@/components/dishes/edit-dishIngredient-form";

interface Props {
    dishIngredient: DishIngredients;
}

export default function DishActions({ dishIngredient }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);

    const { toast } = useToast();
    const router = useRouter();

    const onDelete = useCallback(async () => {
        setIsLoading(true);
        try {
            await axios.delete(
                `/api/dishIngredient/${dishIngredient.dishIngredientId}`
            );
            setOpenDialog(false);
            setIsLoading(false);
            toast({
                description: `Recipe ${dishIngredient.name} was deleted.`,
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
    }, [dishIngredient.dishIngredientId, dishIngredient.name, router, toast]);

    return (
        <>
            <div className="flex space-x-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Edit
                                onClick={() => setIsEditFormOpen(true)}
                                className="w-4 h-4 text-gray-500"
                            />
                        </TooltipTrigger>
                        <TooltipContent className="bg-muted text-foreground rounded-3xl">
                            <p>Edit amount</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Trash2
                                onClick={() => setOpenDialog(true)}
                                className="w-4 h-4 text-red-500"
                            />
                        </TooltipTrigger>
                        <TooltipContent className="bg-red-600 text-white rounded-3xl">
                            <p>Remove ingredient</p>
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
                            This will remove {dishIngredient.name} from this
                            dish.
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
            <EditDishIngredientForm
                dishIngredient={dishIngredient}
                isOpen={isEditFormOpen}
                setIsOpen={setIsEditFormOpen}
            />
        </>
    );
}
