"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next-intl/client";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function LocaleSwitcher() {
    const t = useTranslations("LocaleSwitcher");
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    function onSelectChange(locale: string) {
        router.replace(pathname, { locale });
    }

    return (
        <Select
            defaultValue={locale}
            onValueChange={(value) => onSelectChange(value)}>
            <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
                {["en", "de"].map((cur) => (
                    <SelectItem value={cur} key={cur}>
                        {t("locale", { locale: cur })}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
