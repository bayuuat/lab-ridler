const dayFormatterCache = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timezone: string): Intl.DateTimeFormat {
  const cached = dayFormatterCache.get(timezone);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  });

  dayFormatterCache.set(timezone, formatter);
  return formatter;
}

export type LocalDateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

export function getLocalDateTimeParts(date: Date, timezone: string): LocalDateTimeParts {
  const parts = formatterFor(timezone).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => {
    const part = parts.find((item) => item.type === type);
    if (!part) throw new Error(`Unable to read ${type} for timezone ${timezone}`);
    return Number(part.value);
  };

  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour"),
    minute: value("minute")
  };
}

export function toHabitDayString(parts: Pick<LocalDateTimeParts, "year" | "month" | "day">): string {
  return [
    parts.year.toString().padStart(4, "0"),
    parts.month.toString().padStart(2, "0"),
    parts.day.toString().padStart(2, "0")
  ].join("-");
}

export function addDaysToHabitDay(habitDay: string, days: number): string {
  const [year, month, day] = habitDay.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

export function compareHabitDays(left: string, right: string): number {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

export function getHabitDay(date: Date, timezone: string): string {
  const local = getLocalDateTimeParts(date, timezone);
  const localDay = toHabitDayString(local);

  if (local.hour < 1) {
    return addDaysToHabitDay(localDay, -1);
  }

  return localDay;
}
