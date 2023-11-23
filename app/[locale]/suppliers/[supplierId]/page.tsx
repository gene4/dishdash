import { auth, redirectToSignIn } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "./overview";
import { DataTable } from "./data-table";
import { IngredientsTable } from "./ingredients-table";
import InfoCard from "./info-card";
import { QueryClient } from "@tanstack/react-query";

interface RecipeIdPageProps {
    params: {
        supplierId: string;
    };
}

export default async function RecipesIdPage({ params }: RecipeIdPageProps) {
    const { userId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }

    const queryClient = new QueryClient();

    const deliveries = await prismadb.delivery.findMany({
        where: {
            userId,
            supplierId: params.supplierId,
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

    const ingredients = await prismadb.ingredient.findMany({
        where: {
            userId,
            supplierId: params.supplierId,
        },
    });

    return supplier ? (
        <>
            <div className="flex flex-col mb-8 md:flex-row space-y-6 md:space-y-0 justify-between items-start">
                <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight transition-colors first:mt-0">
                    Supplier:{" "}
                    <span className="font-normal">{supplier?.name}</span>
                </h1>
            </div>
            <Tabs defaultValue="overview">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                    <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                    <TabsTrigger value="info">Information</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                    <Overview
                        deliveries={deliveries}
                        yearsFromInvoices={yearsFromDeliveries.reverse()}
                    />
                </TabsContent>
                <TabsContent className="relative h-full" value="invoices">
                    <DataTable data={invoices} supplier={supplier} />
                </TabsContent>
                <TabsContent className="relative h-full" value="ingredients">
                    <IngredientsTable data={ingredients} supplier={supplier} />
                </TabsContent>
                <TabsContent className="relative h-full" value="info">
                    <InfoCard supplier={supplier} />
                </TabsContent>
            </Tabs>
        </>
    ) : (
        <div>Not Found!</div>
    );
}
