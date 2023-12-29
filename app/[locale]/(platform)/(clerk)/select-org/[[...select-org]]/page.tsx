import { OrganizationList } from "@clerk/nextjs";
export default function CreateOrganizationPage() {
    return (
        <div className="h-full flex justify-center items-center">
            <OrganizationList
                hidePersonal
                afterCreateOrganizationUrl={"/"}
                afterSelectOrganizationUrl={"/"}
            />
        </div>
    );
}
