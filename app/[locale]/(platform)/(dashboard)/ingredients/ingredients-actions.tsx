"use client";

import React, { useState } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Ingredient } from "@prisma/client";
import { Edit } from "lucide-react";
import { Row } from "@tanstack/react-table";
import EditIngredientForm from "@/components/ingredients/table/edit-ingredient-form";

function IngredientsActions({ row }: { row: Row<Ingredient> }) {
    const [isFormOpen, setIsFormOpen] = useState(false);

    const ingredient = row.original;

    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <Edit
                            onClick={(event) => {
                                event.stopPropagation();
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

            <EditIngredientForm
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
                initialIngredient={ingredient}
            />
        </>
    );
}

export default IngredientsActions;
