import { expect, test } from "@playwright/test";
import { fixture } from "../app/demo/fixture";
import { resolveToday } from "../app/demo/hours";
import { groundingPrompt, reply } from "../app/demo/reply";

const DASH = "\u2013";

function atChicago(year: number, month: number, day: number, hour: number, minute: number) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  for (const offset of [5, 6]) {
    const date = new Date(Date.UTC(year, month - 1, day, hour + offset, minute));
    const parts = Object.fromEntries(fmt.formatToParts(date).map((part) => [part.type, part.value]));
    const gotHour = parts.hour === "24" ? 0 : Number(parts.hour);
    if (
      Number(parts.year) === year &&
      Number(parts.month) === month &&
      Number(parts.day) === day &&
      gotHour === hour &&
      Number(parts.minute) === minute
    ) {
      return date;
    }
  }
  throw new Error(`No America/Chicago instant for ${year}-${month}-${day} ${hour}:${minute}`);
}

function line(weekday: string, hoursLabel: string, open: boolean) {
  return `Today is ${weekday}; today's hours: ${hoursLabel}; currently ${open ? "open" : "closed"}`;
}

const weekHours = [
  "Monday 8:00 AM to 9:00 PM",
  "Closed Tuesday",
  "Wednesday 8:00 AM to 9:00 PM",
  "Thursday 11:00 AM to 2:00 PM and 5:00 PM to 9:00 PM",
  "Friday 8:00 AM to 10:00 PM",
  "Saturday 8:00 AM to 10:00 PM",
  "Sunday 8:00 AM to 10:00 PM",
].join(". ");

const week = { ...fixture, hours: weekHours };

test("each weekday resolves today's hours into the prompt and the fallback", () => {
  const cases = [
    { day: 16, weekday: "Monday", label: `8:00 AM${DASH}9:00 PM`, open: true },
    { day: 17, weekday: "Tuesday", label: "closed", open: false },
    { day: 18, weekday: "Wednesday", label: `8:00 AM${DASH}9:00 PM`, open: true },
    { day: 19, weekday: "Thursday", label: `11:00 AM${DASH}2:00 PM, 5:00 PM${DASH}9:00 PM`, open: true },
    { day: 20, weekday: "Friday", label: `8:00 AM${DASH}10:00 PM`, open: true },
    { day: 21, weekday: "Saturday", label: `8:00 AM${DASH}10:00 PM`, open: true },
    { day: 15, weekday: "Sunday", label: `8:00 AM${DASH}10:00 PM`, open: true },
  ];

  for (const item of cases) {
    const now = atChicago(2026, 11, item.day, 12, 0);
    const today = resolveToday(weekHours, now);
    const expected = line(item.weekday, item.label, item.open);
    expect(today.weekday).toBe(item.weekday);
    expect(today.hoursLabel).toBe(item.label);
    expect(today.openNow).toBe(item.open);
    expect(today.line).toBe(expected);
    expect(groundingPrompt(week, now)).toContain(expected);
    const answer = reply(week, "What are your hours today?", now);
    expect(answer.text).toContain(expected);
    expect(answer.text).toContain(weekHours);
  }

  const monday = resolveToday(weekHours, atChicago(2026, 11, 16, 12, 0));
  const friday = resolveToday(weekHours, atChicago(2026, 11, 20, 18, 0));
  expect(monday.hoursLabel).toBe(`8:00 AM${DASH}9:00 PM`);
  expect(friday.hoursLabel).toBe(`8:00 AM${DASH}10:00 PM`);
  expect(monday.hoursLabel).not.toBe(friday.hoursLabel);
});

test("Saturday night uses the later close, not the Monday close", () => {
  const hours = "Mon/Wed/Thu 8 AM\u20139 PM and Fri\u2013Sun 8 AM\u201310 PM";
  const now = atChicago(2026, 11, 14, 23, 26);
  const today = resolveToday(hours, now);
  const expected = line("Saturday", `8:00 AM${DASH}10:00 PM`, false);
  expect(today.line).toBe(expected);
  expect(today.hoursLabel).not.toBe(`8:00 AM${DASH}9:00 PM`);

  const profile = { ...fixture, hours };
  expect(groundingPrompt(profile, now)).toContain(expected);
  expect(reply(profile, "Are you open right now?", now).text).toContain(expected);

  expect(resolveToday(hours, atChicago(2026, 11, 14, 8, 0)).openNow).toBe(true);
  expect(resolveToday(hours, atChicago(2026, 11, 14, 22, 0)).openNow).toBe(false);

  const monday = resolveToday(hours, atChicago(2026, 11, 16, 12, 0));
  const friday = resolveToday(hours, atChicago(2026, 11, 20, 21, 30));
  expect(monday.hoursLabel).toBe(`8:00 AM${DASH}9:00 PM`);
  expect(monday.openNow).toBe(true);
  expect(friday.hoursLabel).toBe(`8:00 AM${DASH}10:00 PM`);
  expect(friday.openNow).toBe(true);
  expect(monday.hoursLabel).not.toBe(friday.hoursLabel);

  const tuesday = resolveToday(hours, atChicago(2026, 11, 17, 12, 0));
  expect(tuesday.hoursLabel).toBeNull();
  expect(tuesday.openNow).toBeNull();
  expect(tuesday.line).toContain("Today is Tuesday");
  expect(tuesday.line).toContain("Do not guess");
  expect(groundingPrompt({ ...fixture, hours }, atChicago(2026, 11, 17, 12, 0))).toContain(tuesday.line);
});

test("a day with two ranges is open only inside a range", () => {
  const label = `11:00 AM${DASH}2:00 PM, 5:00 PM${DASH}9:00 PM`;
  const gap = resolveToday(weekHours, atChicago(2026, 11, 19, 15, 0));
  expect(gap.hoursLabel).toBe(label);
  expect(gap.openNow).toBe(false);
  expect(resolveToday(weekHours, atChicago(2026, 11, 19, 18, 0)).openNow).toBe(true);
  expect(resolveToday(weekHours, atChicago(2026, 11, 19, 14, 0)).openNow).toBe(false);
  expect(resolveToday(weekHours, atChicago(2026, 11, 19, 11, 0)).openNow).toBe(true);
});

test("the fictional fixture resolves its own week", () => {
  const tuesdayDinner = resolveToday(fixture.hours, atChicago(2026, 11, 17, 18, 30));
  expect(tuesdayDinner.line).toBe(line("Tuesday", `5:00 PM${DASH}9:00 PM`, true));

  const tuesdayNoon = resolveToday(fixture.hours, atChicago(2026, 11, 17, 12, 0));
  expect(tuesdayNoon.hoursLabel).toBe(`5:00 PM${DASH}9:00 PM`);
  expect(tuesdayNoon.openNow).toBe(false);

  const monday = resolveToday(fixture.hours, atChicago(2026, 11, 16, 18, 0));
  expect(monday.hoursLabel).toBe("closed");
  expect(monday.openNow).toBe(false);

  const friday = resolveToday(fixture.hours, atChicago(2026, 11, 20, 18, 0));
  expect(friday.hoursLabel).toBe(`5:00 PM${DASH}10:00 PM`);
  expect(friday.openNow).toBe(true);
  expect(friday.hoursLabel).not.toBe(monday.hoursLabel);

  const saturdayLate = resolveToday(fixture.hours, atChicago(2026, 11, 14, 23, 26));
  expect(saturdayLate.weekday).toBe("Saturday");
  expect(saturdayLate.hoursLabel).toBe(`5:00 PM${DASH}10:00 PM`);
  expect(saturdayLate.openNow).toBe(false);
  expect(groundingPrompt(fixture, atChicago(2026, 11, 14, 23, 26))).toContain(saturdayLate.line);
  expect(reply(fixture, "What are your hours today?", atChicago(2026, 11, 14, 23, 26)).text).toContain(saturdayLate.line);
});

test("unparsed hours name the Chicago day and do not invent a range", () => {
  const now = atChicago(2026, 11, 14, 23, 26);
  const today = resolveToday("call us whenever", now);
  expect(today.weekday).toBe("Saturday");
  expect(today.hoursLabel).toBeNull();
  expect(today.openNow).toBeNull();
  expect(today.line).toContain("Today is Saturday");
  expect(today.line).toContain("Do not guess");
  const prompt = groundingPrompt({ ...fixture, hours: "call us whenever" }, now);
  expect(prompt).toContain(today.line);
  expect(prompt).not.toContain(`8:00 AM${DASH}`);
  const answer = reply({ ...fixture, hours: "call us whenever" }, "Are you open?", now);
  expect(answer.text).toContain("call us whenever");
  expect(answer.text).toContain(today.line);
});
