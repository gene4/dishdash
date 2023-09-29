"use client";

import {
    Navbar as NextUINavbar,
    NavbarContent,
    NavbarMenu,
    NavbarMenuToggle,
    NavbarBrand,
    NavbarItem,
    NavbarMenuItem,
} from "@nextui-org/navbar";

import { Link } from "@nextui-org/link";

import { ChefHat } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

import { link as linkStyles } from "@nextui-org/theme";

import NextLink from "next/link";
import clsx from "clsx";

import LocaleSwitcher from "./locale-switch";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "./theme-switch";

export const Navbar = () => {
    return (
        <header className="flex items-center justify-between px-5 py-2 h-13 border-b shadow-sm">
            <NextLink
                className="flex justify-start items-center gap-1"
                href="/">
                <ChefHat className="w-7 h-7" strokeWidth="1.5px" />
                <p className="font-bold text-inherit">DishDash</p>
            </NextLink>
            <div className="flex items-center space-x-4">
                <LocaleSwitcher />
                <ThemeSwitch />
                <UserButton />
            </div>
        </header>
    );
};
