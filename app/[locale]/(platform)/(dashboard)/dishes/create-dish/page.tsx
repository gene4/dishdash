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
            <h1 className="scroll-m-20 pb-2 text-2xl font-semibold tracking-tight transition-colors first:mt-0 mb-5">
                Create Dish
            </h1>
            <CreateDishForm />
        </>
    );
}
