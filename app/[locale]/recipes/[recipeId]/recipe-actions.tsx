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
import RecipeIngredientForm from "@/components/recipes/recipeIngredient-form";
import { Recipe, RecipeIngredient } from "@prisma/client";
import { toast } from "sonner";

interface Props {
    recipeIngredient: RecipeIngredient;
    initialRecipe: Recipe & { ingredients: RecipeIngredient[] };
}

function RecipeActions({ recipeIngredient, initialRecipe }: Props) {
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);

    const router = useRouter();

    const onDelete = useCallback(async () => {
        setOpenDialog(false);

        const response = axios
            .delete(`/api/recipeIngredient/${recipeIngredient.id}`)
            .then(() => {
                router.refresh();
            });

        toast.promise(response, {
            loading: "Loading...",
            success: () => {
                return `Ingredient was deleted.`;
            },
            error: "Error",
        });
    }, [recipeIngredient.id, router]);

    return (
        <>
            <div className="flex space-x-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Edit
                                onClick={() => setIsEditFormOpen(true)}
                                className="w-4 h-4 cursor-pointer text-muted-foreground hover:scale-110 transition-all"
                            />
                        </TooltipTrigger>
                        <TooltipContent className="bg-muted text-foreground rounded-3xl">
                            <p>Edit</p>
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
                        <TooltipContent className="bg-red-600 text-white rounded-3xl">
                            <p>Remove</p>
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
                            This will remove the ingredient from this recipe.
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
            <RecipeIngredientForm
                initialRecipeIngredient={recipeIngredient}
                isOpen={isEditFormOpen}
                setIsOpen={setIsEditFormOpen}
                initialRecipe={initialRecipe}
            />
        </>
    );
}

export default RecipeActions;
