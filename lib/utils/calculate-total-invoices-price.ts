import { InvoiceT } from "@/app/[locale]/invoices/data-table";
import { Row } from "@tanstack/react-table";

export function calculateTotalInvoicesPrice(selectedRows: Row<InvoiceT>[]) {
    if (!selectedRows || selectedRows.length === 0) {
        return 0; // No rows selected, so the total price is 0
    }

    const totalPrice = selectedRows.reduce((total, row) => {
        const price = row.original.amount || 0;
        return total + price;
    }, 0);

    return totalPrice;
}
