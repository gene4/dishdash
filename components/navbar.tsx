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
import { Button } from "@nextui-org/button";
import { Kbd } from "@nextui-org/kbd";
import { Link } from "@nextui-org/link";
import { Input } from "@nextui-org/input";
import { ChefHat } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

import { link as linkStyles } from "@nextui-org/theme";

import NextLink from "next/link";
import clsx from "clsx";

import { ThemeSwitch } from "@/components/theme-switch";
import LocaleSwitcher from "./locale-switch";
import { siteConfig } from "@/config/site";

export const Navbar = () => {
    return (
        <NextUINavbar
            isBlurred
            isBordered
            className="shadow-sm"
            height={"3rem"}
            maxWidth="xl"
            position="sticky">
            <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
                <NavbarBrand as="li" className="gap-3 text-lg max-w-fit">
                    <NextLink
                        className="flex justify-start items-center gap-1"
                        href="/">
                        <ChefHat className="w-7 h-7" strokeWidth="1.5px" />
                        <p className="font-bold text-inherit">DishDash</p>
                    </NextLink>
                </NavbarBrand>
                {/* <ul className="hidden lg:flex gap-4 justify-start ml-2">
                    {siteConfig.navItems.map((item) => (
                        <NavbarItem key={item.href}>
                            <NextLink
                                className={clsx(
                                    linkStyles({ color: "foreground" }),
                                    "data-[active=true]:text-primary data-[active=true]:font-medium"
                                )}
                                color="foreground"
                                href={item.href}>
                                {item.label}
                            </NextLink>
                        </NavbarItem>
                    ))}
                </ul> */}
            </NavbarContent>

            <NavbarContent
                className="hidden sm:flex basis-1/5 sm:basis-full"
                justify="end">
                <LocaleSwitcher />

                <NavbarItem className="hidden sm:flex gap-2">
                    <ThemeSwitch />
                </NavbarItem>
                <UserButton />
            </NavbarContent>

            <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
                <LocaleSwitcher />
                <ThemeSwitch />
                <NavbarMenuToggle />
            </NavbarContent>

            <NavbarMenu>
                <div className="mx-4 mt-2 flex flex-col gap-2">
                    {siteConfig.mobileNavItems.map((item, index) => (
                        <NavbarMenuItem key={`${item}-${index}`}>
                            <Link
                                color={
                                    index === 2
                                        ? "primary"
                                        : index ===
                                          siteConfig.mobileNavItems.length - 1
                                        ? "danger"
                                        : "foreground"
                                }
                                href="#"
                                size="lg">
                                {item.label}
                            </Link>
                        </NavbarMenuItem>
                    ))}
                </div>
            </NavbarMenu>
        </NextUINavbar>
    );
};
