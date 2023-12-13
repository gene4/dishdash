export function calculateDeliveryTotal(items: any) {
    let total = 0;

    for (const item of items) {
        // Extract the numeric part of the VAT string and convert it to a number
        const vatPercentage = parseInt(item.ingredient.vat, 10) / 100;

        // Calculate the total for each item and add it to the overall total
        total += item.price * (1 + vatPercentage);
    }

    return total;
}

export const calculateDeliverySummary = (items: any) => {
    const summary = items.reduce(
        (acc: any, item: any) => {
            // Check if the VAT property exists for the item
            if (item.vat) {
                // Parse the VAT string to a numeric value
                const vat = parseFloat(item.vat.replace("%", "")) / 100;

                // Calculate netto sum (without tax)
                acc.nettoSum += item.price;

                // Calculate tax amount for 7%
                if (vat === 0.07) {
                    acc.taxAmount7 += item.price * vat;
                }

                // Calculate tax amount for 19%
                if (vat === 0.19) {
                    acc.taxAmount19 += item.price * vat;
                }

                // Calculate total
                acc.total += item.price + item.price * vat;
            }
            return acc;
        },
        { nettoSum: 0, taxAmount7: 0, taxAmount19: 0, total: 0 }
    );

    return summary;
};
