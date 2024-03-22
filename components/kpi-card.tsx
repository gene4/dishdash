import React from "react";

interface Props {
    label: string;
    value: number | string | React.ReactNode;
}

export default function KpiCard({ label, value }: Props) {
    return (
        <div className="rounded-lg p-4 border text-left bg-card text-card-foreground shadow-sm min-w-[160px]">
            <p className="text-muted-foreground text-xs">{label}</p>
            <p className="font-semibold text-xl">{value}</p>
        </div>
    );
}
