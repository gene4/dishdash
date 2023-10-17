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
import { RecipeIngredients } from "./data-table";
import RecipeIngredientForm from "@/components/recipes/recipeIngredient-form";
import { Ingredient } from "@prisma/client";

interface Props {
    recipeIngredient: RecipeIngredients;
    ingredients: Ingredient[];
}

function RecipeActions({ recipeIngredient, ingredients }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);

    const { toast } = useToast();
    const router = useRouter();

    const onDelete = useCallback(async () => {
        setIsLoading(true);
        try {
            await axios.delete(
                `/api/recipeIngredient/${recipeIngredient.recipeIngredientId}`
            );
            setOpenDialog(false);
            setIsLoading(false);
            toast({
                description: `Recipe ${recipeIngredient.name} was deleted.`,
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
    }, [
        recipeIngredient.name,
        recipeIngredient.recipeIngredientId,
        router,
        toast,
    ]);

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
                            This will remove {recipeIngredient.name} from this
                            recipe.
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
            <RecipeIngredientForm
                initialRecipeIngredient={recipeIngredient}
                isOpen={isEditFormOpen}
                ingredients={ingredients}
                setIsOpen={setIsEditFormOpen}
            />
        </>
    );
}

export default RecipeActions;
