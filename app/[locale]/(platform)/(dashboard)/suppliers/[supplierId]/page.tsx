import { auth, redirectToSignIn } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import SupplierTabs from "./supplier-tabs";
import { redirect } from "next/navigation";
import { NavBreadcrumb } from "@/components/ui/breadcrumb";

interface RecipeIdPageProps {
    params: {
        supplierId: string;
    };
}

export default async function SupplierIdPage({ params }: RecipeIdPageProps) {
    const { userId, orgRole, orgId } = auth();
    if (!orgId) {
        redirect("/select-org");
    }

    if (orgRole === "basic_member") {
        redirect("/");
    }

    if (!userId) {
        return redirectToSignIn();
    }

    const deliveries = await prismadb.delivery.findMany({
        where: {
            orgId,
            supplierId: params.supplierId,
        },
        include: {
            supplier: { select: { name: true } },
            items: { include: { ingredient: true } },
        },
    });
    const yearsFromDeliveries: string[] = [];

    deliveries.forEach((delivery) => {
        const year = delivery.date.getFullYear();
        if (!yearsFromDeliveries.includes(year.toString())) {
            yearsFromDeliveries.push(year.toString());
        }
    });

    const supplier = await prismadb.supplier.findUnique({
        where: {
            orgId,
            id: params.supplierId,
        },
    });

    await Promise.all([deliveries, supplier]);

    return supplier ? (
        <>
            <div className="flex flex-col mb-8 md:flex-row space-y-6 md:space-y-0 justify-between items-start">
                <NavBreadcrumb
                    primary={{ label: "Suppliers", href: "/suppliers" }}
                    secondary={supplier?.name}
                />
            </div>
            <SupplierTabs
                supplier={supplier}
                deliveries={deliveries}
                yearsFromDeliveries={yearsFromDeliveries}
            />
        </>
    ) : (
        <div>Not Found!</div>
    );
}
