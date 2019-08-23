import { addDays, addMonths, differenceInDays, differenceInMonths, differenceInQuarters  } from 'date-fns';
import { addQuarters, differenceInYears, addYears } from 'date-fns/esm';

export function dateRange(start: string, end: string, interval: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (interval === "day") {
    const days = differenceInDays(endDate, startDate);  
      if (days > 0) {
        return [...Array(days+1).keys()].map((i) => addDays(startDate, i));
      }
      else {
        return []
      }
  }

  if (interval === "month") {
    const months = differenceInMonths(endDate, startDate);
    if (months > 0) {
      return [...Array(months+1).keys()].map((i) => addMonths(startDate, i));
    }
    else {
      return []
    }
  }

  if (interval === "quarter") {
    const quarters = differenceInQuarters(endDate, startDate);
    if (quarters > 0) {
      return [...Array(quarters+1).keys()].map((i) => addQuarters(startDate, i));
    }
    else {
      return []
    }
  }

  if (interval === "year") {
    const years = differenceInYears(endDate, startDate);
    if (years > 0) {
      return [...Array(years+1).keys()].map((i) => addYears(startDate, i));
    }
    else {
      return []
    }
  }
}