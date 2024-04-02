import { auth, redirectToSignIn } from "@clerk/nextjs";
import CreateDishForm from "@/components/dishes/create-dish-form";
import { redirect } from "next/navigation";

export default async function CreateDishePage() {
    const { userId, orgRole } = auth();

    if (orgRole === "basic_member") {
        redirect("/");
    }

    if (!userId) {
        return redirectToSignIn();
    }

    return (
        <>
            <h1 className="text-2xl font-semibold tracking-tight mb-10">
                Create Dish
            </h1>
            <CreateDishForm />
        </>
    );
}
