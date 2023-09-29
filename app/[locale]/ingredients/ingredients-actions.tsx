"use client";

import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Ingredient } from "@prisma/client";
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
import IngredientForm from "@/components/ingredients/table/ingredient-form";

interface Props {
    ingredient: Ingredient;
}

function IngredientsActions({ ingredient }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { toast } = useToast();
    const router = useRouter();

    const onDelete = useCallback(async () => {
        setIsLoading(true);
        try {
            await axios.delete(`/api/ingredient/${ingredient.id}`);
            setOpenDialog(false);
            setIsLoading(false);
            toast({
                description: `Ingredient ${ingredient.name} was deleted.`,
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
    }, [ingredient.id, ingredient.name, router, toast]);

    return (
        <>
            <div className="flex space-x-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <Edit
                                onClick={() => setIsFormOpen(true)}
                                className="w-4 h-4 text-gray-500"
                            />
                        </TooltipTrigger>
                        <TooltipContent className="bg-muted text-foreground rounded-3xl">
                            <p>Edit ingredient</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogTrigger>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-red-600 text-white rounded-3xl">
                                    <p>Delete ingredient</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. This will
                                permanently delete your account and remove your
                                data from our servers.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button>Cancel</Button>
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
                <IngredientForm
                    isOpen={isFormOpen}
                    setIsOpen={setIsFormOpen}
                    initialIngredient={ingredient}
                />
            </div>
        </>
    );
}

export default IngredientsActions;
