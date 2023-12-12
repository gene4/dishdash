"use client";

import { dark } from "@clerk/themes";
import {
    UserButton,
    // OrganizationSwitcher,
    // useOrganization,
} from "@clerk/nextjs";
import Link from "next/link";
import LocaleSwitcher from "./locale-switch";
import { ThemeSwitch } from "./theme-switch";
import MobileSidebar from "./mobile-sidbar";
import { useTheme } from "next-themes";
import Image from "next/image";

export const Navbar = () => {
    const { theme } = useTheme();
    // const { organization } = useOrganization();

    return (
        <header className="flex sticky z-50 top-0 bg-background/95 backdrop-blur items-center justify-between px-3 md:px-6 h-16 border-b md:border-none">
            <Link className="flex justify-start items-center gap-2" href="/">
                <Image
                    priority
                    width={36}
                    height={36}
                    alt="logo"
                    src="/logo.svg"
                />
                <p className="font-bold text-inherit">DishDash</p>
            </Link>
            <div className="flex items-center space-x-2 md:space-x-4">
                <div className="hidden md:flex items-center space-x-4">
                    <LocaleSwitcher />
                    <ThemeSwitch />
                </div>

                {/* @ts-ignore */}
                <UserButton appearance={theme === "dark" ? dark : undefined} />
                <MobileSidebar />
            </div>
            <div className="hidden md:block absolute bottom-0 left-56 right-7 opacity-90  h-[1px] bg-border" />
        </header>
    );
};
