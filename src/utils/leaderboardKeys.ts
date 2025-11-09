// utils/leaderboardKeys.ts
export function todayKey(tz = "America/Mexico_City") {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
  });
  const [y, m, d] = fmt.format(now).split("-");
  return `${y}-${m}-${d}`; // YYYY-MM-DD
}

export function dailyKey(tz = "America/Mexico_City") {
  return todayKey(tz).replace(/-/g, ""); // YYYYMMDD
}

export function isoWeekKey(date = new Date(), tz = "America/Mexico_City") {
  const local = new Date(date.toLocaleString("en-US", { timeZone: tz }));
  const tmp = new Date(Date.UTC(local.getFullYear(), local.getMonth(), local.getDate()));
  const dayNum = (tmp.getUTCDay() + 6) % 7;      // lunes=0
  tmp.setUTCDate(tmp.getUTCDate() - dayNum + 3); // jueves ISO
  const firstThursday = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((tmp.getTime() - firstThursday.getTime()) / 86400000 - 3 +
        ((firstThursday.getUTCDay() + 6) % 7)) / 7
    );
  return `${tmp.getUTCFullYear()}_${String(week).padStart(2, "0")}`; // YYYY_WW
}
