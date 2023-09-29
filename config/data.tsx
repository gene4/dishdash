const ingredientsColumns = [
    { name: "NAME", uid: "name", sortable: true },
    { name: "UNIT", uid: "unit", sortable: true },
    { name: "PRICE", uid: "price", sortable: true },
    { name: "SUPPLIER", uid: "supplier", sortable: true },
    { name: "CATEGORY", uid: "category", sortable: true },
    { name: "UPDATED AT", uid: "updatedAt", sortable: true },
    { name: "ACTIONS", uid: "actions" },
];

const recipesColumns = [
    { name: "NAME", uid: "name", sortable: true },
    { name: "UNIT", uid: "unit", sortable: true },
    { name: "YIELD", uid: "yield", sortable: true },
    { name: "TOTAL PRICE", uid: "totalPrice", sortable: true },
    { name: "PRICE PER UNIT", uid: "pricePer", sortable: true },
    { name: "UPDATED AT", uid: "updatedAt", sortable: true },
    { name: "ACTIONS", uid: "actions" },
];

export { ingredientsColumns, recipesColumns };
