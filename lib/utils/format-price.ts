export const formatPrice = (price: number) => {
    const formatted = new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
    }).format(price);

    return formatted;
};
