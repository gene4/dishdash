"use client";

import { ChefHat } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import NextLink from "next/link";
import LocaleSwitcher from "./locale-switch";
import { ThemeSwitch } from "./theme-switch";
import MobileSidebar from "./mobile-sidbar";

export const Navbar = () => {
    return (
        <header className="flex items-center justify-between px-3 md:px-5 py-2 h-13 border-b shadow-sm">
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
