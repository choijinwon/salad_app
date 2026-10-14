function validateZoneInput(body) {
  if (typeof body.zoneName !== "string" || !body.zoneName.trim() || body.zoneName.trim().length > 80) return "구역명을 80자 이내로 입력해주세요.";
  if (body.color != null && (typeof body.color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(body.color))) return "구역 색상이 올바르지 않습니다.";
  const points = body.boundary;
  if (points == null) return "";
  if (!Array.isArray(points) || points.length < 3 || points.length > 200 || points.some((p) => !Array.isArray(p) || p.length !== 2 || !p.every(Number.isFinite) || Math.abs(p[0]) > 90 || Math.abs(p[1]) > 180)) return "올바른 경계점을 3개 이상 200개 이하로 입력해주세요.";
  if (new Set(points.map((p) => p.join(","))).size !== points.length) return "중복된 경계점이 있습니다.";
  const turn = (a, b, c) => (b[1] - a[1]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[1] - a[1]);
  const on = (p, a, b) => Math.abs(turn(a, b, p)) < 1e-12 && p[0] >= Math.min(a[0], b[0]) - 1e-12 && p[0] <= Math.max(a[0], b[0]) + 1e-12 && p[1] >= Math.min(a[1], b[1]) - 1e-12 && p[1] <= Math.max(a[1], b[1]) + 1e-12;
  for (let i = 0; i < points.length; i++) for (let j = i + 1; j < points.length; j++) {
    if (j === i + 1 || (i === 0 && j === points.length - 1)) continue;
    const [a, b, c, d] = [points[i], points[(i + 1) % points.length], points[j], points[(j + 1) % points.length]];
    if ((turn(a, b, c) * turn(a, b, d) < 0 && turn(c, d, a) * turn(c, d, b) < 0) || on(c, a, b) || on(d, a, b) || on(a, c, d) || on(b, c, d)) return "경계선이 서로 교차합니다.";
  }
  const area = points.reduce((sum, a, i) => { const b = points[(i + 1) % points.length]; return sum + a[1] * b[0] - b[1] * a[0]; }, 0);
  return Math.abs(area) < 1e-10 ? "배송 범위의 면적이 없습니다." : "";
}

module.exports = { validateZoneInput };
