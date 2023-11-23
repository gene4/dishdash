import { set, format, addMonths } from "date-fns";

export function getNextPaymentDate(dayOfMonth: number) {
    const currentDate = new Date();

    // Set the day of the month to the provided day
    const nextDate = set(currentDate, { date: dayOfMonth });

    // If the next date is in the past, add one month
    if (nextDate < currentDate) {
        return format(addMonths(nextDate, 1), "dd/MM/yy");
    }
    console.log("from function", format(nextDate, "dd/MM/yy"));

    return format(nextDate, "dd/MM/yy");
}
