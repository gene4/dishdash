"use client";

import { siteConfig } from "@/config/site";
import { link as linkStyles } from "@nextui-org/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { Link } from "@nextui-org/react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export const Sidebar = () => {
    const t = useTranslations("Navigation");
    const pathname = usePathname();
    return (
        <aside className="flex space-y-4 flex-col h-full border-r border-divider shadow-sm w-40">
            <div className="p-4 flex-1 justify-center">
                <div className="space-y-2">
                    {siteConfig.navItems.map((item) => (
                        <Link
                            as={NextLink}
                            size="sm"
                            className={clsx(
                                pathname === item.href &&
                                    "bg-primary text-white",
                                "w-full rounded-xl py-1 px-3"
                            )}
                            key={item.href}
                            color="foreground"
                            href={item.href}>
                            <item.icon className="mr-2 w-4 h-4" />
                            {t(item.label)}
                        </Link>
                    ))}
                </div>
            </div>
        </aside>
    );
};
