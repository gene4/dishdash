export type SiteConfig = typeof siteConfig;
import { Banana, Pizza, ClipboardList, Truck, UserCircle2 } from "lucide-react";

export const siteConfig = {
    name: "Dishdash",
    description:
        "Manage your restaurant operations effortlessly. Explore your restaurant's data, create new dishes, and stay on top of inventory.",
    navItems: [
        {
            label: "ingredients",
            href: "/ingredients",
            icon: Banana,
            restricted: false,
        },
        {
            label: "recipes",
            href: "/recipes",
            icon: ClipboardList,
            restricted: true,
        },
        {
            label: "dishes",
            href: "/dishes",
            icon: Pizza,
            restricted: true,
        },

        {
            label: "suppliers",
            href: "/suppliers",
            icon: UserCircle2,
            restricted: true,
        },
        {
            label: "deliveries",
            href: "/deliveries",
            icon: Truck,
            restricted: false,
        },
    ],
};
