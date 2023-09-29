import { auth, redirectToSignIn } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default async function IngredientsPage() {
    const { userId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }
    const ingredients = await prismadb.ingredient.findMany({
        where: {
            userId,
        },
    });

    return (
        <div>
            <h1 className="mt-10 scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0  mb-5">
                Ingredients
            </h1>
            <DataTable columns={columns} data={ingredients} />
        </div>
    );
}
