import { auth, redirectToSignIn } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import SupplierTabs from "./supplier-tabs";

interface RecipeIdPageProps {
    params: {
        supplierId: string;
    };
}

export default async function SupplierIdPage({ params }: RecipeIdPageProps) {
    const { userId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }

    const deliveries = await prismadb.delivery.findMany({
        where: {
            userId,
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
            userId,
            id: params.supplierId,
        },
    });

    await Promise.all([deliveries, supplier]);

    return supplier ? (
        <>
            <div className="flex flex-col mb-8 md:flex-row space-y-6 md:space-y-0 justify-between items-start">
                <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight transition-colors first:mt-0">
                    Supplier:{" "}
                    <span className="font-normal">{supplier?.name}</span>
                </h1>
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
