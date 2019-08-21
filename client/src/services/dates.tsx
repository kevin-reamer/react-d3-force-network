import { addDays, addMonths, differenceInDays, differenceInMonths, differenceInQuarters  } from 'date-fns';
import { addQuarters, differenceInYears, addYears } from 'date-fns/esm';

export function dateRange(start: string, end: string, interval: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (interval === "day") {
    const days = differenceInDays(endDate, startDate);  
    return [...Array(days+1).keys()].map((i) => addDays(startDate, i));
  }

  if (interval === "month") {
    const months = differenceInMonths(endDate, startDate);
    return [...Array(months+1).keys()].map((i) => addMonths(startDate, i));
  }

  if (interval === "quarter") {
    const quarters = differenceInQuarters(endDate, startDate);
    return [...Array(quarters+1).keys()].map((i) => addQuarters(startDate, i));
  }

  if (interval === "year") {
    const years = differenceInYears(endDate, startDate);
    return [...Array(years+1).keys()].map((i) => addYears(startDate, i));
  }
}