export const formatDate = (date: Date) => {
    const toDateType = new Date(date);
    const formattedDate = new Intl.DateTimeFormat("en-GB").format(toDateType);

    return formattedDate;
};
