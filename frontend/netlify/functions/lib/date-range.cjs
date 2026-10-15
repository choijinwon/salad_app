function parseDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1000) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : null;
}

function dateRangeError(from, to) {
  const start = parseDate(from);
  const end = parseDate(to);
  if (!start || !end || from > to) return "시작일과 종료일을 올바르게 지정해주세요.";
  return (end - start) / 86400000 >= 366 ? "조회 기간은 최대 366일입니다." : "";
}

module.exports = { dateRangeError };
