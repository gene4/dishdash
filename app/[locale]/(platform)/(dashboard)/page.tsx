/* eslint-disable react/no-unescaped-entities */
"use client";

import Lottie from "lottie-react";
import { useTranslations } from "next-intl";
import animation from "../../../../public/home.json";

export default function Home() {
    const t = useTranslations("HomePage_Dashboard");

    return (
        <section className="flex flex-col items-center justify-center h-full md:gap-4 py-8 md:py-10">
            <div className="inline-block max-w-lg text-center justify-center">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                    {t("headline")}
                </h1>
                <br />
                <h2>{t("subheading")}</h2>
                <h2>{t("description")}</h2>
            </div>
            <div className="w-60">
                <Lottie animationData={animation} loop={true} />
            </div>
        </section>
    );
}
