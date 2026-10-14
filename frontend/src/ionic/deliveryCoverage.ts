export type ZoneRange = { color?: string; points: number[][] };
export type ZoneRanges = Record<string, ZoneRange>;

function turn(a: number[], b: number[], c: number[]) {
  return (b[1] - a[1]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[1] - a[1]);
}

function onSegment(point: number[], a: number[], b: number[]) {
  return Math.abs(turn(a, b, point)) < 1e-12 &&
    point[0] >= Math.min(a[0], b[0]) - 1e-12 && point[0] <= Math.max(a[0], b[0]) + 1e-12 &&
    point[1] >= Math.min(a[1], b[1]) - 1e-12 && point[1] <= Math.max(a[1], b[1]) + 1e-12;
}

function intersects(a: number[], b: number[], c: number[], d: number[]) {
  return (turn(a, b, c) * turn(a, b, d) < 0 && turn(c, d, a) * turn(c, d, b) < 0) ||
    onSegment(c, a, b) || onSegment(d, a, b) || onSegment(a, c, d) || onSegment(b, c, d);
}

export function zonePolygonError(points: number[][]): string {
  if (points.length < 3) return "경계점을 3개 이상 지정해주세요.";
  if (points.length > 200) return "경계점은 최대 200개까지 지정할 수 있습니다.";
  if (points.some((p) => p.length !== 2 || !p.every(Number.isFinite) || Math.abs(p[0]) > 90 || Math.abs(p[1]) > 180)) {
    return "올바른 위도와 경도를 입력해주세요.";
  }
  if (new Set(points.map((p) => p.join(","))).size !== points.length) return "같은 위치의 경계점이 중복되어 있습니다.";
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      if (j === i + 1 || (i === 0 && j === points.length - 1)) continue;
      if (intersects(points[i], points[(i + 1) % points.length], points[j], points[(j + 1) % points.length])) {
        return "경계선이 서로 교차합니다. 경계점 위치를 조정해주세요.";
      }
    }
  }
  const area = points.reduce((sum, a, i) => {
    const b = points[(i + 1) % points.length];
    return sum + a[1] * b[0] - b[1] * a[0];
  }, 0);
  return Math.abs(area) < 1e-10 ? "배송 범위가 일직선입니다. 경계점 위치를 조정해주세요." : "";
}

export function pointInZone(point: number[], polygon: number[][]) {
  if (polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[j];
    const b = polygon[i];
    if (onSegment(point, a, b)) return true;
    if ((a[0] > point[0]) !== (b[0] > point[0]) &&
      point[1] < (b[1] - a[1]) * (point[0] - a[0]) / (b[0] - a[0]) + a[1]) inside = !inside;
  }
  return inside;
}
