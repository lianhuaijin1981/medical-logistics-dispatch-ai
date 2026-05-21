import type { GeoPoint } from '@med/shared-types';

const EARTH_RADIUS = 6371000; // meters

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Haversine 距离计算（米） */
export function calculateDistance(a: GeoPoint, b: GeoPoint): number {
  const [lon1, lat1] = a.coordinates;
  const [lon2, lat2] = b.coordinates;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const a_ =
    sinDLat * sinDLat + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(a_), Math.sqrt(1 - a_));

  return EARTH_RADIUS * c;
}

/** 射线法判断点是否在多边形内 */
export function pointInPolygon(point: GeoPoint, polygon: GeoPoint[]): boolean {
  const [x, y] = point.coordinates;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i].coordinates;
    const [xj, yj] = polygon[j].coordinates;

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

export function getBoundingBox(points: GeoPoint[]): {
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
} {
  let minLon = Infinity,
    maxLon = -Infinity;
  let minLat = Infinity,
    maxLat = -Infinity;

  for (const p of points) {
    minLon = Math.min(minLon, p.coordinates[0]);
    maxLon = Math.max(maxLon, p.coordinates[0]);
    minLat = Math.min(minLat, p.coordinates[1]);
    maxLat = Math.max(maxLat, p.coordinates[1]);
  }

  return { minLon, maxLon, minLat, maxLat };
}

export function isWithinTimeWindow(
  time: string,
  start: string,
  end: string,
): boolean {
  const t = new Date(time).getTime();
  return t >= new Date(start).getTime() && t <= new Date(end).getTime();
}
