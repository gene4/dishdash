"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Coins, MoreHorizontal, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import DeliveryForm from "@/components/delivery/delivery-form";

export default function DeliveryActions() {
    const [isDeliveryDialogOpen, setIsDeliverDialogOpen] = useState(false);

    const { push } = useRouter();

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant={"outline"} size={"icon"}>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                        onClick={() => push("/deliveries/add-delivery")}
                        className="flex items-center justify-between">
                        Receive delivery <Truck className="w-4 h-4" />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                            setIsDeliverDialogOpen(true);
                            document.body.style.pointerEvents = "";
                        }}
                        className="flex items-center justify-between">
                        Add credit <Coins className="w-4 h-4" />
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Dialog
                open={isDeliveryDialogOpen}
                onOpenChange={setIsDeliverDialogOpen}>
                <DialogContent className="md:w-fit">
                    <DialogHeader>
                        <DialogTitle>Add Credit</DialogTitle>
                        <DialogDescription>
                            A general credit invoice
                        </DialogDescription>
                    </DialogHeader>
                    <DeliveryForm
                        isCredit
                        setIsDialog={setIsDeliverDialogOpen}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
