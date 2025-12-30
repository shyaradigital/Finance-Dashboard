/**
 * Date utility functions for finance calculations
 */

export function getStartOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getEndOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function getStartOfQuarter(date: Date = new Date()): Date {
  const quarter = Math.floor(date.getMonth() / 3);
  return new Date(date.getFullYear(), quarter * 3, 1);
}

export function getEndOfQuarter(date: Date = new Date()): Date {
  const quarter = Math.floor(date.getMonth() / 3);
  return new Date(date.getFullYear(), (quarter + 1) * 3, 0, 23, 59, 59, 999);
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

export function calculateNextRecurringDate(
  lastDate: Date,
  frequency: string,
  customDays?: number
): Date {
  switch (frequency) {
    case "monthly":
      return addMonths(lastDate, 1);
    case "quarterly":
      return addMonths(lastDate, 3);
    case "yearly":
      return addYears(lastDate, 1);
    case "custom":
      if (customDays) {
        return addDays(lastDate, customDays);
      }
      return addMonths(lastDate, 1); // Default to monthly if customDays not provided
    default:
      return addMonths(lastDate, 1);
  }
}

export function getDaysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isWithinDays(date: Date, days: number): boolean {
  const daysUntil = getDaysUntil(date);
  return daysUntil >= 0 && daysUntil <= days;
}

export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

