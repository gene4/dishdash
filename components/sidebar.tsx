"use client";

import { siteConfig } from "@/config/site";
import NextLink from "next/link";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

interface Props {
    setIsOpen?: (open: boolean) => void;
}

export const Sidebar = ({ setIsOpen }: Props) => {
    const t = useTranslations("Navigation");
    const pathname = usePathname();

    return (
        <aside className="flex space-y-4 flex-col h-full md:border-r md:border-divider md:shadow-sm md:w-40">
            <div className="p-4 flex-1 justify-center">
                <div className="space-y-2">
                    {siteConfig.navItems.map((item) => (
                        <NextLink
                            onClick={() => setIsOpen && setIsOpen(false)}
                            className={clsx(
                                "flex items-center hover:bg-muted",
                                pathname === item.href &&
                                    "bg-primary hover:bg-primary text-white",
                                "w-full rounded-xl py-1 px-3"
                            )}
                            key={item.href}
                            href={item.href}>
                            <item.icon className="mr-2 w-4 h-4" />
                            {t(item.label)}
                        </NextLink>
                    ))}
                </div>
            </div>
        </aside>
    );
};
