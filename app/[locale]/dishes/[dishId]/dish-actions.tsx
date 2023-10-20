"use client";

import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit, Trash2 } from "lucide-react";
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
import DishIngredientForm from "@/components/dishes/dishIngredient-form";
import { IngredientsAndRecipes } from "../data-table";
import { DishIngredients } from "./data-table";
import { toast } from "sonner";

interface Props {
    dishIngredient: DishIngredients;
    ingredientsAndRecipes: IngredientsAndRecipes;
}

export default function DishActions({
    dishIngredient,
    ingredientsAndRecipes,
}: Props) {
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);

    const router = useRouter();

    const onDelete = useCallback(async () => {
        setOpenDialog(false);

        const response = axios
            .delete(`/api/dishIngredient/${dishIngredient.dishIngredientId}`)
            .then(() => {
                router.refresh();
            });

        toast.promise(response, {
            loading: "Loading...",
            success: () => {
                return `Ingredient ${dishIngredient.name} was deleted.`;
            },
            error: "Error",
        });
    }, [dishIngredient.dishIngredientId, dishIngredient.name, router]);

    return (
        <>
            <div className="flex space-x-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Edit
                                onClick={() => setIsEditFormOpen(true)}
                                className="w-4 h-4 text-muted-foreground hover:scale-110 transition-all"
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
                                className="w-4 h-4 text-red-500 hover:scale-110 transition-all"
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
                            onClick={onDelete}
                            className="bg-red-500 hover:bg-red-500/90">
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <DishIngredientForm
                initialDishIngredient={dishIngredient}
                ingredientsAndRecipes={ingredientsAndRecipes}
                isOpen={isEditFormOpen}
                setIsOpen={setIsEditFormOpen}
            />
        </>
    );
}
