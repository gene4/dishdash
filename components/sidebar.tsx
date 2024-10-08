"use client";

import { siteConfig } from "@/config/site";
import Link from "next/link";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import LocaleSwitcher from "./locale-switch";

interface Props {
    setIsOpen?: (open: boolean) => void;
}

export const Sidebar = ({ setIsOpen }: Props) => {
    const t = useTranslations("Navigation");
    const { orgRole } = useAuth();
    const pathname = usePathname();

    return (
        <aside className="flex space-y-4 flex-col md:h-full md:border-divider md:w-40 md:border-r">
            <div className="md:pt-4 md:px-3 h-full flex flex-col justify-between">
                <div className="space-y-2 text-xl md:text-base">
                    {siteConfig.navItems.map((item) => (
                        <Link
                            onClick={() => setIsOpen && setIsOpen(false)}
                            className={clsx(
                                "flex items-center hover:bg-muted text-md md:text-sm font-normal",
                                pathname === item.href &&
                                    "bg-primary hover:bg-primary text-white",
                                "w-full rounded py-1 pl-2",
                                item.restricted &&
                                    orgRole === "basic_member" &&
                                    "hidden"
                            )}
                            key={item.href}
                            href={item.href}>
                            <item.icon
                                strokeWidth={1.5}
                                absoluteStrokeWidth
                                className="mr-2 w-5 h-5"
                            />
                            {t(item.label)}
                        </Link>
                    ))}
                </div>

                {/* <LocaleSwitcher /> */}
            </div>
        </aside>
    );
};
