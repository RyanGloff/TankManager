export default function getStartDay(daysAgo: number): string {
  const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  const yearStr = startDate.getFullYear() % 100;
  const monthStr = `0${startDate.getMonth() + 1}`.slice(-2);
  const dayStr = `0${startDate.getDate()}`.slice(-2);
  const startDateStr = `${yearStr}${monthStr}${dayStr}`;
  return startDateStr;
}
