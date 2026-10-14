import { IonIcon } from "@ionic/react";
import { addOutline, checkmarkOutline, closeOutline, locateOutline, pencilOutline, refreshOutline, trashOutline, arrowUndoOutline } from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import { pointInZone, zonePolygonError, type ZoneRange, type ZoneRanges } from "./deliveryCoverage";
import "./deliveryCoverage.css";

type MapPoint = { getLat: () => number; getLng: () => number };
type Overlay = { setMap: (map: unknown | null) => void };
export type CoverageMapApi = {
  LatLng: new (lat: number, lng: number) => MapPoint;
  LatLngBounds: new () => { extend: (point: unknown) => void };
  Map: new (container: HTMLElement, options: { center: unknown; level: number }) => {
    setBounds: (bounds: unknown) => void;
    relayout: () => void;
  };
  Marker: new (options: { map: unknown; position: unknown; draggable?: boolean }) => Overlay & { getPosition: () => MapPoint };
  CustomOverlay: new (options: { map: unknown; position: unknown; content: HTMLElement | string; yAnchor?: number }) => Overlay;
  Polygon: new (options: { map: unknown; path: unknown[]; fillColor: string; fillOpacity: number; strokeColor: string; strokeWeight: number; strokeOpacity: number; strokeStyle: string }) => Overlay;
  Polyline: new (options: { map: unknown; path: unknown[]; strokeColor: string; strokeWeight: number; strokeOpacity: number; strokeStyle: string }) => Overlay;
  event: {
    addListener: (target: unknown, name: string, handler: (event: { latLng: MapPoint }) => void) => void;
    removeListener: (target: unknown, name: string, handler: (event: { latLng: MapPoint }) => void) => void;
  };
};

export type CoverageSaveInput = { name: string; range: ZoneRange };
type CoverageDelivery = { id: string; customer: string; lat: number; lng: number };

export function DeliveryCoverageManagement({ zoneNames, ranges, assignments, deliveries, loadMap, onSave, newRequest = 0 }: {
  zoneNames: string[];
  ranges: ZoneRanges;
  assignments: Record<string, string>;
  deliveries: CoverageDelivery[];
  loadMap: () => Promise<CoverageMapApi>;
  onSave: (input: CoverageSaveInput) => Promise<string>;
  newRequest?: number;
}) {
  const names = Array.from(new Set([...zoneNames, ...Object.keys(ranges)]));
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#16a34a");
  const [points, setPoints] = useState<number[][]>([]);
  const [drawing, setDrawing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [focusVersion, setFocusVersion] = useState(0);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const matchingDeliveries = deliveries.filter((delivery) => pointInZone([delivery.lat, delivery.lng], points));
  const polygonError = zonePolygonError(points);

  function startNew() {
    setSelected(null);
    setName("");
    setPoints([]);
    setDrawing(true);
    setMessage("");
    setError("");
  }

  useEffect(() => { if (newRequest > 0) startNew(); }, [newRequest]);

  function selectZone(zone: string) {
    setSelected(zone);
    setName(zone);
    setColor(ranges[zone]?.color ?? "#16a34a");
    setPoints(ranges[zone]?.points.map((point) => [...point]) ?? []);
    setDrawing(false);
    setMessage("");
    setError("");
    setFocusVersion((version) => version + 1);
  }

  async function save() {
    const trimmedName = name.trim();
    const validation = !trimmedName ? "구역명을 입력해주세요." : !selected && names.includes(trimmedName)
      ? "같은 이름의 구역이 있습니다. 기존 구역을 선택해 수정해주세요." : polygonError;
    if (validation) { setError(validation); return; }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const result = await onSave({ name: trimmedName, range: { color, points } });
      setSelected(trimmedName);
      setName(trimmedName);
      setDrawing(false);
      setMessage(result);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "범위를 저장하지 못했습니다. 다시 시도해주세요.");
    } finally { setSaving(false); }
  }

  return (
    <section className="coverage-manager" aria-label="배송 범위 관리">
      <aside className="coverage-zone-list">
        <div className="coverage-list-heading"><strong>배송 구역 {names.length}개</strong><button title="새 구역 추가" aria-label="새 구역 추가" onClick={startNew} disabled={saving} type="button"><IonIcon icon={addOutline} /></button></div>
        <input aria-label="구역 검색" placeholder="구역 검색" value={search} onChange={(event) => setSearch(event.currentTarget.value)} />
        <div className="coverage-zone-items">
          {names.filter((zone) => zone.includes(search.trim())).map((zone) => (
            <button key={zone} className={selected === zone ? "selected" : ""} disabled={saving} onClick={() => selectZone(zone)} type="button">
              <span className="coverage-swatch" style={{ background: ranges[zone]?.color ?? "#98a2b3" }} />
              <span><strong>{zone}</strong><small>{assignments[zone] || "담당 기사 미지정"} · {ranges[zone] ? "범위 지정됨" : "범위 미지정"}</small></span>
            </button>
          ))}
          {!names.some((zone) => zone.includes(search.trim())) && <p>검색된 구역이 없습니다.</p>}
        </div>
      </aside>
      <div className="coverage-editor">
        <div className="coverage-form">
          <label>구역명<input value={name} readOnly={selected !== null} disabled={saving} placeholder="예: 여의도 동부" maxLength={80} onChange={(event) => setName(event.currentTarget.value)} /></label>
          <label className="coverage-color">구역 색상<input type="color" value={color} disabled={saving} onChange={(event) => setColor(event.currentTarget.value)} /></label>
          <span className="coverage-point-count">경계점 {points.length}개 · 배송지 {matchingDeliveries.length}곳</span>
        </div>
        <div className="coverage-toolbar">
          <button className={drawing ? "active" : ""} aria-pressed={drawing} disabled={saving} onClick={() => setDrawing((value) => !value)} type="button"><IonIcon icon={pencilOutline} />경계 지정</button>
          <button aria-label="마지막 경계점 취소" title="마지막 경계점 취소" disabled={!points.length || saving} onClick={() => setPoints((current) => current.slice(0, -1))} type="button"><IonIcon icon={arrowUndoOutline} /></button>
          <button aria-label="경계 초기화" title="경계 초기화" disabled={!points.length || saving} onClick={() => { setPoints([]); setDrawing(true); }} type="button"><IonIcon icon={trashOutline} /></button>
          <button aria-label="현재 범위에 지도 맞추기" title="현재 범위에 지도 맞추기" onClick={() => setFocusVersion((version) => version + 1)} type="button"><IonIcon icon={locateOutline} /></button>
          <button className="coverage-save" disabled={saving || !name.trim() || !!polygonError} onClick={save} type="button"><IonIcon icon={checkmarkOutline} />{saving ? "저장 중…" : "범위 저장"}</button>
          {selected && <button title="변경 취소" disabled={saving} onClick={() => selectZone(selected)} type="button"><IonIcon icon={closeOutline} />취소</button>}
        </div>
        <CoverageMap color={color} drawing={drawing && !saving} focusVersion={focusVersion} loadMap={loadMap} points={points} ranges={ranges} selected={selected} onPointsChange={setPoints} />
        <div className="coverage-feedback" aria-live="polite">
          {error ? <p role="alert" className="error">{error}</p> : message ? <p className="success">{message}</p> : <p>{points.length ? (polygonError || "저장 가능한 배송 범위") : "배송 범위 미지정"}</p>}
        </div>
        <details className="coverage-coordinates">
          <summary>경계점 목록 ({points.length})</summary>
          <ol>{points.map(([lat, lng], index) => <li key={index}><span>{index + 1}. {lat.toFixed(6)}, {lng.toFixed(6)}</span><button type="button" aria-label={`${index + 1}번 경계점 삭제`} disabled={saving} onClick={() => setPoints((current) => current.filter((_, i) => i !== index))}><IonIcon icon={closeOutline} /></button></li>)}</ol>
          <div className="coverage-coordinate-inputs">
            <input type="number" step="any" aria-label="경계점 위도" placeholder="위도" value={manualLat} onChange={(event) => setManualLat(event.currentTarget.value)} />
            <input type="number" step="any" aria-label="경계점 경도" placeholder="경도" value={manualLng} onChange={(event) => setManualLng(event.currentTarget.value)} />
            <button type="button" title="경계점 추가" aria-label="좌표로 경계점 추가" disabled={saving || points.length >= 200 || !manualLat || !manualLng} onClick={() => {
              const point = [Number(manualLat), Number(manualLng)];
              if (!point.every(Number.isFinite) || Math.abs(point[0]) > 90 || Math.abs(point[1]) > 180) { setError("올바른 위도와 경도를 입력해주세요."); return; }
              setPoints((current) => [...current, point]); setManualLat(""); setManualLng(""); setError("");
            }}><IonIcon icon={addOutline} /></button>
          </div>
        </details>
      </div>
    </section>
  );
}

function CoverageMap({ loadMap, points, ranges, selected, color, drawing, focusVersion, onPointsChange }: {
  loadMap: () => Promise<CoverageMapApi>;
  points: number[][];
  ranges: ZoneRanges;
  selected: string | null;
  color: string;
  drawing: boolean;
  focusVersion: number;
  onPointsChange: (update: (current: number[][]) => number[][]) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState<{ maps: CoverageMapApi; map: InstanceType<CoverageMapApi["Map"]> } | null>(null);
  const [mapError, setMapError] = useState("");
  const [retry, setRetry] = useState(0);
  const latest = useRef({ points, ranges, drawing, onPointsChange });
  latest.current = { points, ranges, drawing, onPointsChange };

  useEffect(() => {
    let canceled = false;
    let cleanup = () => {};
    setMapError("");
    setReady(null);
    loadMap().then((maps) => {
      if (canceled || !containerRef.current) return;
      containerRef.current.replaceChildren();
      const map = new maps.Map(containerRef.current, { center: new maps.LatLng(37.5665, 126.978), level: 8 });
      const click = (event: { latLng: MapPoint }) => {
        if (!latest.current.drawing) return;
        latest.current.onPointsChange((current) => current.length >= 200 ? current : [...current, [event.latLng.getLat(), event.latLng.getLng()]]);
      };
      maps.event.addListener(map, "click", click);
      const initialPoints = latest.current.points.length ? latest.current.points : Object.values(latest.current.ranges).flatMap((range) => range.points);
      if (initialPoints.length) { const bounds = new maps.LatLngBounds(); initialPoints.forEach(([lat, lng]) => bounds.extend(new maps.LatLng(lat, lng))); map.setBounds(bounds); }
      const resize = new ResizeObserver(() => map.relayout());
      resize.observe(containerRef.current);
      cleanup = () => { maps.event.removeListener(map, "click", click); resize.disconnect(); };
      setReady({ maps, map });
    }).catch((reason) => { if (!canceled) setMapError(reason instanceof Error ? reason.message : "지도를 불러오지 못했습니다."); });
    return () => { canceled = true; cleanup(); };
  }, [loadMap, retry]);

  useEffect(() => {
    if (!ready) return;
    const { map, maps } = ready;
    const overlays: Overlay[] = [];
    Object.entries(ranges).filter(([zone]) => zone !== selected).forEach(([zone, range]) => {
      const polygon = new maps.Polygon({ map, path: range.points.map(([lat, lng]) => new maps.LatLng(lat, lng)), fillColor: range.color ?? "#64748b", fillOpacity: 0.1, strokeColor: range.color ?? "#64748b", strokeOpacity: 0.5, strokeStyle: "solid", strokeWeight: 2 });
      overlays.push(polygon);
      const center = range.points.reduce((sum, point) => [sum[0] + point[0] / range.points.length, sum[1] + point[1] / range.points.length], [0, 0]);
      const label = document.createElement("span"); label.className = "coverage-map-label"; label.textContent = zone;
      overlays.push(new maps.CustomOverlay({ map, content: label, position: new maps.LatLng(center[0], center[1]), yAnchor: 0.5 }));
    });
    if (points.length >= 3) overlays.push(new maps.Polygon({ map, path: points.map(([lat, lng]) => new maps.LatLng(lat, lng)), fillColor: color, fillOpacity: 0.28, strokeColor: color, strokeOpacity: 1, strokeStyle: "solid", strokeWeight: 3 }));
    else if (points.length === 2) overlays.push(new maps.Polyline({ map, path: points.map(([lat, lng]) => new maps.LatLng(lat, lng)), strokeColor: color, strokeOpacity: 1, strokeStyle: "solid", strokeWeight: 3 }));
    const listeners: Array<() => void> = [];
    points.forEach(([lat, lng], index) => {
      const position = new maps.LatLng(lat, lng);
      const marker = new maps.Marker({ map, position, draggable: true });
      const drag = () => { const point = marker.getPosition(); onPointsChange((current) => current.map((old, i) => i === index ? [point.getLat(), point.getLng()] : old)); };
      maps.event.addListener(marker, "dragend", drag);
      listeners.push(() => maps.event.removeListener(marker, "dragend", drag));
      const number = document.createElement("span"); number.className = "coverage-map-vertex"; number.textContent = String(index + 1); number.style.background = color;
      overlays.push(marker, new maps.CustomOverlay({ map, content: number, position, yAnchor: 2.7 }));
    });
    return () => { listeners.forEach((remove) => remove()); overlays.forEach((overlay) => overlay.setMap(null)); };
  }, [ready, points, ranges, selected, color, onPointsChange]);

  useEffect(() => {
    if (!ready) return;
    const focusPoints = latest.current.points.length ? latest.current.points : Object.values(latest.current.ranges).flatMap((range) => range.points);
    if (!focusPoints.length) return;
    const bounds = new ready.maps.LatLngBounds();
    focusPoints.forEach(([lat, lng]) => bounds.extend(new ready.maps.LatLng(lat, lng)));
    ready.map.setBounds(bounds);
  }, [ready, focusVersion]);

  return <div className={`coverage-map ${drawing ? "drawing" : ""}`}>
    <div className="coverage-map-surface" ref={containerRef} />
    {mapError ? <div className="coverage-map-error"><strong>지도를 불러오지 못했습니다.</strong><p>{mapError}</p><button type="button" onClick={() => setRetry((value) => value + 1)}><IonIcon icon={refreshOutline} />다시 연결</button></div> : !ready && <div className="coverage-map-error">지도 연결 중…</div>}
    {ready && <span className="coverage-map-mode">{drawing ? "경계 지정 중" : "지도 탐색"}</span>}
  </div>;
}
