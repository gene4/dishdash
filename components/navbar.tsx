"use client";

import { dark } from "@clerk/themes";
import { ChefHat } from "lucide-react";
import {
    UserButton,
    // OrganizationSwitcher,
    // useOrganization,
} from "@clerk/nextjs";
import NextLink from "next/link";
import LocaleSwitcher from "./locale-switch";
import { ThemeSwitch } from "./theme-switch";
import MobileSidebar from "./mobile-sidbar";
import { useTheme } from "next-themes";

export const Navbar = () => {
    const { theme } = useTheme();
    // const { organization } = useOrganization();

    return (
        <header className="flex sticky z-50 top-0 bg-background/95 backdrop-blur items-center justify-between px-3 md:px-6 h-14 border-b shadow-sm">
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

                {/* @ts-ignore */}
                <UserButton appearance={theme === "dark" ? dark : undefined} />
                <MobileSidebar />
            </div>
        </header>
    );
};
