import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <Navbar />
            <div className="md:flex h-[calc(100vh-4rem)]">
                <div className="hidden top-14 fixed md:sticky md:flex w-fit flex-col ">
                    <Sidebar />
                </div>
                <main className="mx-auto max-w-7xl py-6 px-4 md:px-6 flex-1 flex-grow overflow-y-scroll">
                    {children}
                </main>
                {/* <footer className="w-full flex items-center justify-center py-3">
                                    <span className="text-default-600">
                                        © DishDash
                                    </span>
                                </footer> */}
            </div>
        </>
    );
};

export default DashboardLayout;
