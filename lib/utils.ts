import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const nestedRecipeItems = {
    ingredients: {
        include: {
            ingredient: {
                include: {
                    selectedDeliveryPrice: true,
                },
            },
            recipeIngredient: {
                include: {
                    ingredients: {
                        include: {
                            ingredient: {
                                include: {
                                    selectedDeliveryPrice: true,
                                },
                            },
                            recipeIngredient: {
                                include: {
                                    ingredients: {
                                        include: {
                                            ingredient: {
                                                include: {
                                                    selectedDeliveryPrice: true,
                                                },
                                            },
                                            recipeIngredient: {
                                                include: {
                                                    ingredients: {
                                                        include: {
                                                            ingredient: {
                                                                include: {
                                                                    selectedDeliveryPrice:
                                                                        true,
                                                                },
                                                            },
                                                            recipeIngredient: {
                                                                include: {
                                                                    ingredients:
                                                                        {
                                                                            include:
                                                                                {
                                                                                    ingredient:
                                                                                        {
                                                                                            include:
                                                                                                {
                                                                                                    selectedDeliveryPrice:
                                                                                                        true,
                                                                                                },
                                                                                        },
                                                                                },
                                                                        },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};
