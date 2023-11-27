import React, { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Sidebar } from "./sidebar";
import { Button } from "./ui/button";
import LocaleSwitcher from "./locale-switch";
import { ThemeSwitch } from "./theme-switch";
import Image from "next/image";
import { Separator } from "./ui/separator";

function MobileSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button size={"icon"} variant={"ghost"}>
                        <Menu />
                    </Button>
                </SheetTrigger>
                <SheetContent className="pt-20" side={"top"}>
                    <Separator className="absolute top-14 left-0" />
                    <div className="absolute top-3 left-4 flex justify-start items-center gap-1">
                        <Image
                            priority
                            width={36}
                            height={36}
                            alt="logo"
                            src="/logo.svg"
                        />
                        <p className="font-bold text-inherit">DishDash</p>
                    </div>
                    <div className="absolute top-2 right-12">
                        <ThemeSwitch />
                    </div>

                    <Sidebar setIsOpen={setIsOpen} />
                    <div className="mt-6 text-right flex w-full">
                        <span className="ml-auto">
                            <LocaleSwitcher />
                        </span>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}

export default MobileSidebar;
