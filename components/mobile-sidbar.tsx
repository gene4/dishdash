import React, { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Sidebar } from "./sidebar";
import { Button } from "./ui/button";

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
                <SheetContent className="pt-8" side={"left"}>
                    <Sidebar setIsOpen={setIsOpen} />
                </SheetContent>
            </Sheet>
        </div>
    );
}

export default MobileSidebar;
