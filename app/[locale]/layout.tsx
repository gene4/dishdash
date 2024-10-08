import "@/styles/globals.css";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider } from "next-intl";
import { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import { deDE } from "@clerk/localizations";
import { Toaster } from "sonner";
import clsx from "clsx";
import TanstackProvider from "@/components/tanstack-provider";

type Props = {
    children: ReactNode;
    params: { locale: string };
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
            <TanstackProvider>
                <html lang={locale} suppressHydrationWarning>
                    <head />
                    <body
                        className={clsx(
                            "min-h-screen bg-background font-sans antialiased",
                            fontSans.variable
                        )}>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="system"
                            enableSystem
                            disableTransitionOnChange>
                            <div
                                style={{
                                    WebkitTapHighlightColor: "transparent",
                                }}>
                                <NextIntlClientProvider
                                    locale={locale}
                                    messages={messages}>
                                    {children}

                                    <Toaster richColors />
                                </NextIntlClientProvider>
                            </div>
                        </ThemeProvider>
                    </body>
                </html>
            </TanstackProvider>
        </ClerkProvider>
    );
}
