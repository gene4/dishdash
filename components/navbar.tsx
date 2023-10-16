"use client";

import { ChefHat } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import NextLink from "next/link";
import LocaleSwitcher from "./locale-switch";
import { ThemeSwitch } from "./theme-switch";
import MobileSidebar from "./mobile-sidbar";

export const Navbar = () => {
    return (
        <header className="flex sticky z-50 top-0 bg-background/95 backdrop-blur items-center justify-between container h-14 border-b shadow-sm">
            <NextLink
                className="flex justify-start items-center gap-1"
                href="/">
                <ChefHat className="w-7 h-7" strokeWidth="1.5px" />
                <p className="font-bold text-inherit">DishDash</p>
            </NextLink>
            <div className="flex items-center space-x-2 md:space-x-4">
                <div className="hidden md:flex items-center space-x-4">
                    <LocaleSwitcher />
                    <ThemeSwitch />
                </div>
                <UserButton />
                <MobileSidebar />
            </div>
        </header>
    );
};
