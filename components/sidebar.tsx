"use client";

import { siteConfig } from "@/config/site";
import Link from "next/link";
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
        <aside className="flex space-y-4 flex-col md:h-full md:border-divider  md:w-48">
            <div className="md:p-4 flex-1 justify-center">
                <div className="space-y-2 text-xl md:text-base">
                    {siteConfig.navItems.map((item) => (
                        <Link
                            onClick={() => setIsOpen && setIsOpen(false)}
                            className={clsx(
                                "flex items-center hover:bg-muted text-md md:text-sm font-normal",
                                pathname === item.href &&
                                    "bg-primary hover:bg-primary text-white",
                                "w-full rounded-lg py-1 px-3"
                            )}
                            key={item.href}
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
