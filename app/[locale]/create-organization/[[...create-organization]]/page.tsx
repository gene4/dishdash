import { CreateOrganization } from "@clerk/nextjs";

export default function CreateOrganizationPage() {
    return (
        <div className="h-full flex justify-center items-center">
            <CreateOrganization />
        </div>
    );
}
