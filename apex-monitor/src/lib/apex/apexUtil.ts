import { z } from "zod";

export const yymmddSchema = z
  .string()
  .refine((val) => /^\d{6}$/.test(val), {
    message: "Invalid date format. Expected YYMMDD.",
  })
  .transform((val) => {
    const year = parseInt(val.slice(0, 2), 10) + 2000;
    const month = parseInt(val.slice(2, 4), 10) - 1;
    const day = parseInt(val.slice(4, 6), 10);
    return new Date(year, month, day);
  });

export const timestampSchema = z
  .number()
  .transform((val) => new Date(val * 1000));

export function getStartDay(daysAgo: number): string {
  const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  const yearStr = startDate.getFullYear() % 100;
  const monthStr = `0${startDate.getMonth() + 1}`.slice(-2);
  const dayStr = `0${startDate.getDate()}`.slice(-2);
  const startDateStr = `${yearStr}${monthStr}${dayStr}`;
  return startDateStr;
}
