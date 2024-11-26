import { format, isAfter, isBefore, addDays } from 'date-fns';

export const formatDate = (date: string | Date) => {
  return format(new Date(date), 'MMM d, yyyy');
};

export const isExpiringSoon = (date: string | Date, days = 30) => {
  const expiryDate = new Date(date);
  const warningDate = addDays(new Date(), days);
  return isBefore(expiryDate, warningDate) && isAfter(expiryDate, new Date());
};

export const isExpired = (date: string | Date) => {
  return isBefore(new Date(date), new Date());
};