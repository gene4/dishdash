import React, { useState } from "react";
import { FormControl } from "./ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@radix-ui/react-popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import { Button } from "./ui/button";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Ingredient } from "@prisma/client";

interface Props {
    setValue: Function;
    field: any;
    index: number;
    ingredients: any;
    setIsIngredientFormOpen: (open: boolean) => void;
}

export default function IngredientsCommandBox({
    field,
    setValue,
    index,
    ingredients,
    setIsIngredientFormOpen,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <FormControl>
                    <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                            "w-[250px] justify-between",
                            !field.value && "text-muted-foreground"
                        )}>
                        {field.value
                            ? ingredients.find(
                                  (ingredient: any) =>
                                      ingredient.id === field.value
                              )?.name
                            : "Select ingredient"}
                        <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </FormControl>
            </PopoverTrigger>
            <PopoverContent
                side="bottom"
                className="w-[250px] relative z-50 bg-background border rounded-md shadow-md">
                <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandEmpty>
                        No ingredient found.
                        <Button
                            onClick={(event) => {
                                event.preventDefault();
                                setIsIngredientFormOpen(true);
                            }}
                            className="mt-4 rounded-lg"
                            size={"sm"}
                            variant={"outline"}>
                            <Plus className="mr-2 w-3 h-3" />
                            New ingredient
                        </Button>
                    </CommandEmpty>
                    <CommandGroup className="max-h-52 overflow-y-scroll">
                        {ingredients.map((ingredient: any) => (
                            <CommandItem
                                value={ingredient.name}
                                key={ingredient.id}
                                onSelect={() => {
                                    setValue(
                                        `ingredients.${index}.id`,
                                        ingredient.id
                                    );
                                    setValue(
                                        `ingredients.${index}.type`,
                                        "yield" in ingredient
                                            ? "recipe"
                                            : "ingredient"
                                    );

                                    setValue(`ingredientsId`, ingredient.id);
                                    setIsOpen(false);
                                }}>
                                <CheckIcon
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        ingredient.id === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                    )}
                                />
                                {ingredient.name}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
