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
