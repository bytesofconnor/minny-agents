const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export type TodayHours = {
  weekday: Weekday;
  line: string;
} & (
  | { hoursLabel: string; openNow: boolean }
  | { hoursLabel: null; openNow: null }
);

type Range = { start: number; end: number };
type Slot = { known: true; ranges: Range[] } | { known: false };
type Tok =
  | { kind: "day"; day: number }
  | { kind: "through" }
  | { kind: "and" }
  | { kind: "closed" }
  | { kind: "range"; start: number; end: number }
  | { kind: "sep" }
  | { kind: "skip" };

const DAY = /^(sun(?:day)?|mon(?:day)?|tue(?:s(?:day)?)?|wed(?:nesday)?|thu(?:r(?:s(?:day)?)?)?|fri(?:day)?|sat(?:urday)?)\b/i;
const RANGE = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*(?:-|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i;
const FILLER = /^(?:on|from|the|open)\b/i;

function chicagoClock(now: Date) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    fmt
      .formatToParts(now)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  const weekday = parts.weekday;
  const index = WEEKDAYS.indexOf(weekday as Weekday);
  if (index < 0) return null;
  let hour = Number(parts.hour);
  if (hour === 24) hour = 0;
  const minute = Number(parts.minute);
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }
  return { index, weekday: WEEKDAYS[index], minutes: hour * 60 + minute };
}

function toMinutes(hourText: string, minuteText: string | undefined, suffix: string) {
  const hour = Number(hourText);
  const minute = minuteText ? Number(minuteText) : 0;
  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;
  const onClock = hour % 12;
  return (suffix.toLowerCase() === "pm" ? onClock + 12 : onClock) * 60 + minute;
}

function dayIndex(word: string) {
  const key = word.slice(0, 3).toLowerCase();
  const index = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].indexOf(key);
  return index < 0 ? null : index;
}

function tokenize(clause: string): Tok[] | null {
  let rest = clause;
  const tokens: Tok[] = [];
  while (rest.length > 0) {
    rest = rest.trimStart();
    if (!rest) break;
    const range = RANGE.exec(rest);
    if (range) {
      const start = toMinutes(range[1], range[2], range[3]);
      const end = toMinutes(range[4], range[5], range[6]);
      if (start === null || end === null || end <= start) return null;
      tokens.push({ kind: "range", start, end });
      rest = rest.slice(range[0].length);
      continue;
    }
    const closed = /^closed\b/i.exec(rest);
    if (closed) {
      tokens.push({ kind: "closed" });
      rest = rest.slice(closed[0].length);
      continue;
    }
    const through = /^(?:through|thru|to)\b/i.exec(rest);
    if (through) {
      tokens.push({ kind: "through" });
      rest = rest.slice(through[0].length);
      continue;
    }
    const and = /^and\b/i.exec(rest);
    if (and) {
      tokens.push({ kind: "and" });
      rest = rest.slice(and[0].length);
      continue;
    }
    const filler = FILLER.exec(rest);
    if (filler) {
      tokens.push({ kind: "skip" });
      rest = rest.slice(filler[0].length);
      continue;
    }
    const day = DAY.exec(rest);
    if (day) {
      const index = dayIndex(day[1]);
      if (index === null) return null;
      tokens.push({ kind: "day", day: index });
      rest = rest.slice(day[0].length);
      continue;
    }
    if (rest[0] === "," || rest[0] === "/" || rest[0] === "&") {
      tokens.push({ kind: "sep" });
      rest = rest.slice(1);
      continue;
    }
    if (rest[0] === "-") {
      tokens.push({ kind: "through" });
      rest = rest.slice(1);
      continue;
    }
    return null;
  }
  return tokens;
}

function expand(from: number, to: number) {
  const days: number[] = [];
  let day = from;
  for (let step = 0; step < 7; step++) {
    days.push(day);
    if (day === to) return days;
    day = (day + 1) % 7;
  }
  return days;
}

function groupsFrom(tokens: Tok[]) {
  const groups: { days: number[]; ranges: Range[] }[] = [];
  let days: number[] = [];
  let ranges: Range[] = [];
  let closed = false;
  let lastDay: number | null = null;
  let expectDay = false;

  function finish() {
    if (days.length === 0) return false;
    if (closed && ranges.length > 0) return false;
    if (!closed && ranges.length === 0) return false;
    const unique: number[] = [];
    for (const day of days) if (!unique.includes(day)) unique.push(day);
    const next = ranges.slice().sort((a, b) => a.start - b.start);
    groups.push({ days: unique, ranges: closed ? [] : next });
    days = [];
    ranges = [];
    closed = false;
    lastDay = null;
    expectDay = false;
    return true;
  }

  for (const token of tokens) {
    if (expectDay && token.kind !== "day") return null;
    if (token.kind === "skip" || token.kind === "and" || token.kind === "sep") continue;
    if (token.kind === "closed") {
      if (ranges.length > 0 && !finish()) return null;
      closed = true;
      continue;
    }
    if (token.kind === "through") {
      if (lastDay === null || ranges.length > 0) return null;
      expectDay = true;
      continue;
    }
    if (token.kind === "day") {
      if (expectDay && lastDay !== null) {
        const span = expand(lastDay, token.day);
        if (days[days.length - 1] === lastDay) days.pop();
        days.push(...span);
        expectDay = false;
        lastDay = token.day;
        continue;
      }
      if (ranges.length > 0 && !finish()) return null;
      days.push(token.day);
      lastDay = token.day;
      continue;
    }
    if (days.length === 0 || closed) return null;
    ranges.push({ start: token.start, end: token.end });
  }

  if (expectDay) return null;
  if (days.length === 0 && ranges.length === 0 && !closed) return groups;
  if (!finish()) return null;
  return groups;
}

function compileHours(raw: string): Slot[] | null {
  const text = raw
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\b([ap])\.m\./gi, "$1m")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return null;
  const slots: Slot[] = Array.from({ length: 7 }, () => ({ known: false }));
  let sawGroup = false;
  for (const clause of text.split(/[.;]+/)) {
    const trimmed = clause.trim();
    if (!trimmed) continue;
    const tokens = tokenize(trimmed);
    if (!tokens) return null;
    const groups = groupsFrom(tokens);
    if (!groups) return null;
    for (const group of groups) {
      sawGroup = true;
      for (const day of group.days) slots[day] = { known: true, ranges: group.ranges };
    }
  }
  return sawGroup ? slots : null;
}

function formatMinutes(minutes: number) {
  const hour24 = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function formatRanges(ranges: Range[]) {
  return ranges.map((range) => `${formatMinutes(range.start)}\u2013${formatMinutes(range.end)}`).join(", ");
}

function isOpen(ranges: Range[], minutes: number) {
  return ranges.some((range) => minutes >= range.start && minutes < range.end);
}

function unresolved(weekday: Weekday, detail: string): TodayHours {
  return {
    weekday,
    hoursLabel: null,
    openNow: null,
    line: `Today is ${weekday}; ${detail}`,
  };
}

export function resolveToday(hours: string, now: Date): TodayHours {
  const clock = chicagoClock(now);
  if (!clock) {
    throw new Error("America/Chicago clock is unavailable");
  }
  const slots = compileHours(hours);
  if (!slots) {
    return unresolved(clock.weekday, "today's hours are not resolved from the notes. Do not guess today's hours or whether the restaurant is open.");
  }
  const slot = slots[clock.index];
  if (!slot.known) {
    return unresolved(clock.weekday, "today's hours are not in the notes. Do not guess whether the restaurant is open.");
  }
  if (slot.ranges.length === 0) {
    return {
      weekday: clock.weekday,
      hoursLabel: "closed",
      openNow: false,
      line: `Today is ${clock.weekday}; today's hours: closed; currently closed`,
    };
  }
  const hoursLabel = formatRanges(slot.ranges);
  const openNow = isOpen(slot.ranges, clock.minutes);
  return {
    weekday: clock.weekday,
    hoursLabel,
    openNow,
    line: `Today is ${clock.weekday}; today's hours: ${hoursLabel}; currently ${openNow ? "open" : "closed"}`,
  };
}
