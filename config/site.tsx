export type SiteConfig = typeof siteConfig;
import { Home, Banana, Pizza, ClipboardList, Truck } from "lucide-react";

export const siteConfig = {
    name: "Dishdash",
    description:
        "Make beautiful websites regardless of your design experience.",
    navItems: [
        {
            label: "ingredients",
            href: "/ingredients",
            icon: Banana,
        },
        {
            label: "recipes",
            href: "/recipes",
            icon: ClipboardList,
        },
        {
            label: "dishes",
            href: "/dishes",
            icon: Pizza,
        },
        {
            label: "suppliers",
            href: "/suppliers",
            icon: Truck,
        },
    ],
    mobileNavItems: [
        {
            label: "Home",
            href: "/",
            icon: <Home />,
        },

        {
            label: "ingredients",
            href: "/ingredients",
        },
        {
            label: "recipes",
            href: "/recipes",
        },
        {
            label: "dishes",
            href: "/dishes",
        },
        {
            label: "suppliers",
            href: "/suppliers",
        },
        {
            label: "Profile",
            href: "/profile",
        },
        {
            label: "Logout",
            href: "/logout",
        },
    ],
};
