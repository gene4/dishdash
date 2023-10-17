"use client";

import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Ingredient, Supplier } from "@prisma/client";
import { Edit, Trash2 } from "lucide-react";
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
import IngredientForm from "@/components/ingredients/table/ingredient-form";
import { Row } from "@tanstack/react-table";
import { toast } from "sonner";

interface Props {
    row: Row<Ingredient>;
    suppliers: Supplier[];
}

function IngredientsActions({ row, suppliers }: Props) {
    const [openDialog, setOpenDialog] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const router = useRouter();
    const ingredient = row.original;

    const onDelete = useCallback(async () => {
        setOpenDialog(false);

        const response = axios
            .delete(`/api/ingredient/${ingredient.id}`)
            .then(() => {
                router.refresh();
            });

        toast.promise(response, {
            loading: "Loading...",
            success: () => {
                return `Ingredient ${ingredient.name} was deleted.`;
            },
            error: "Error",
        });
    }, [ingredient.id, ingredient.name, router]);

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
                            <p>Edit ingredient</p>
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
                                    <p>Delete ingredient</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            <DialogDescription>
                                This ingredient will be removed from recipes or
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
                <IngredientForm
                    suppliers={suppliers}
                    isOpen={isFormOpen}
                    setIsOpen={setIsFormOpen}
                    initialIngredient={ingredient}
                />
            </div>
        </>
    );
}

export default IngredientsActions;
