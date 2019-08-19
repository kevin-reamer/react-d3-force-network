import { addDays, addMonths, differenceInDays, differenceInMonths  } from 'date-fns';

export function dateRange(start: string, end: string, interval: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (interval === "day") {
    const days = differenceInDays(endDate, startDate);

    return [...Array(days+1).keys()].map((i) => addDays(startDate, i));
  }

  if (interval === "month") {
    const months = differenceInMonths(endDate, startDate);

    console.log(startDate, endDate, interval)

    return [...Array(months+1).keys()].map((i) => addMonths(startDate, i));
  }
}