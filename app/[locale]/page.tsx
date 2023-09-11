/* eslint-disable react/no-unescaped-entities */
"use client";
import NextLink from "next/link";
import { Link } from "@nextui-org/link";
import Lottie from "lottie-react";
import { button as buttonStyles } from "@nextui-org/theme";
import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { useTranslations } from "next-intl";
import animation from "../../public/home.json";

export default function Home() {
    const t = useTranslations("HomePage_Dashboard");

    return (
        <section className="flex flex-col items-center justify-center md:gap-4 py-8 md:py-10">
            <div className="inline-block max-w-lg text-center justify-center">
                <h1 className={title()}>{t("headline")}</h1>
                <br />
                <h2 className={title({ size: "sm", color: "cyan" })}>
                    {t("subheading")}
                </h2>
                <h2 className={subtitle({ class: "mt-4 text-wrap" })}>
                    {t("description")}
                </h2>
            </div>
            <div className="w-48">
                <Lottie animationData={animation} loop={true} />
            </div>
            {/* <div className="flex gap-3">
                <Link
                    isExternal
                    as={NextLink}
                    href={siteConfig.links.docs}
                    className={buttonStyles({
                        color: "primary",
                        radius: "full",
                        variant: "shadow",
                    })}>
                    Documentation
                </Link>
                <Link
                    isExternal
                    as={NextLink}
                    className={buttonStyles({
                        variant: "bordered",
                        radius: "full",
                    })}
                    href={siteConfig.links.github}>
                    <GithubIcon size={20} />
                    GitHub
                </Link>
            </div> */}
        </section>
    );
}
