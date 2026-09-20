function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayInputValue(now: Date = new Date()): string {
  return toDateInputValue(now);
}

export function getWeekFridayInputValue(now: Date = new Date()): string {
  const friday = new Date(now);
  friday.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7));
  return toDateInputValue(friday);
}
