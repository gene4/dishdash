import "@/styles/globals.css";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Providers } from "./providers";
import { Navbar } from "@/components/navbar";
import { NextIntlClientProvider } from "next-intl";
import { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import { deDE } from "@clerk/localizations";
import { Toaster } from "@/components/ui/toaster";

import clsx from "clsx";
import { Sidebar } from "@/components/sidebar";

type Props = {
    children: ReactNode;
    params: { locale: string };
};

export const metadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "white" },
        { media: "(prefers-color-scheme: dark)", color: "black" },
    ],
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon-16x16.png",
        apple: "/apple-touch-icon.png",
    },
};

async function getMessages(locale: string) {
    try {
        return (await import(`../../messages/${locale}.json`)).default;
    } catch (error) {
        notFound();
    }
}

export async function generateStaticParams() {
    return ["en", "de"].map((locale) => ({ locale }));
}
export default async function RootLayout({
    children,
    params: { locale },
}: Props) {
    const messages = await getMessages(locale);
    return (
        <ClerkProvider localization={locale === "de" ? deDE : undefined}>
            <html lang={locale} suppressHydrationWarning>
                <head />
                <body
                    className={clsx(
                        "min-h-screen bg-background font-sans antialiased",
                        fontSans.variable
                    )}>
                    <Providers
                        themeProps={{
                            attribute: "class",
                            defaultTheme: "dark",
                        }}>
                        <div className="relative flex flex-col h-screen">
                            <NextIntlClientProvider
                                locale={locale}
                                messages={messages}>
                                <Navbar />
                                <div className="flex h-full">
                                    <div className="hidden md:flex w-fit flex-col h-full">
                                        <Sidebar />
                                    </div>
                                    <main className="container mx-auto max-w-7xl pt-6 px-6 flex-grow">
                                        {children}
                                    </main>
                                </div>
                                <Toaster />
                                {/* <footer className="w-full flex items-center justify-center py-3">
                                    <span className="text-default-600">
                                        © DishDash
                                    </span>
                                </footer> */}
                            </NextIntlClientProvider>
                        </div>
                    </Providers>
                </body>
            </html>
        </ClerkProvider>
    );
}
