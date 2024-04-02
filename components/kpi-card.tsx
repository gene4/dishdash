import { LucideIcon } from "lucide-react";
import React from "react";

interface Props {
    label: string;
    value: number | string | React.ReactNode;
    Icon: LucideIcon;
}

export default function KpiCard({ label, value, Icon }: Props) {
    return (
        <div className="flex justify-between rounded-lg p-4 border text-xs text-left bg-card text-card-foreground shadow-sm min-w-[160px]">
            <div>
                <div className="text-muted-foreground mb-2">{label}</div>
                <div className="font-semibold text-2xl">{value}</div>
            </div>
            <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
    );
}
