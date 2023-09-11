"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next-intl/client";
import { useTransition } from "react";
import { ChevronDown } from "lucide-react";
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Button,
} from "@nextui-org/react";

export default function LocaleSwitcher() {
    const t = useTranslations("LocaleSwitcher");

    const [isPending, startTransition] = useTransition();
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    function onSelectChange(locale: string) {
        startTransition(() => {
            router.replace(pathname, { locale });
        });
    }

    return (
        <Dropdown classNames={{ base: "w-28" }}>
            <DropdownTrigger>
                <Button
                    endContent={<ChevronDown className="w-4 h-4" />}
                    variant="solid"
                    disabled={isPending}
                    size="sm"
                    className="capitalize">
                    {t("locale", { locale })}
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="Single selection example"
                variant="flat"
                disallowEmptySelection
                selectionMode="single"
                selectedKeys={locale}>
                {["en", "de"].map((cur) => (
                    <DropdownItem
                        onClick={() => onSelectChange(cur)}
                        value={cur}
                        key={cur}>
                        {t("locale", { locale: cur })}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    );
}
