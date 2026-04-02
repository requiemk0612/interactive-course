import type { Point2D } from '../types'

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function rotatePoint(point: Point2D, angle: number): Point2D {
  return {
    x: point.x * Math.cos(angle) - point.y * Math.sin(angle),
    y: point.x * Math.sin(angle) + point.y * Math.cos(angle),
  }
}

export function pointInPolygon(point: Point2D, polygon: Point2D[]) {
  let isInside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y
    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi + Number.EPSILON) + xi

    if (intersect) {
      isInside = !isInside
    }
  }

  return isInside
}

export function toSvgX(x: number, width: number, minX: number, maxX: number) {
  return ((x - minX) / (maxX - minX)) * width
}

export function toSvgY(y: number, height: number, minY: number, maxY: number) {
  return height - ((y - minY) / (maxY - minY)) * height
}

export function fromSvgToModel(
  px: number,
  py: number,
  width: number,
  height: number,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
) {
  return {
    x: minX + (px / width) * (maxX - minX),
    y: maxY - (py / height) * (maxY - minY),
  }
}

type Bounds = {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export function getLineEndpoints(
  wx: number,
  wy: number,
  bias: number,
  bounds: Bounds,
) {
  const candidates: Point2D[] = []

  if (Math.abs(wy) > 1e-6) {
    const yAtMinX = -(wx * bounds.minX + bias) / wy
    const yAtMaxX = -(wx * bounds.maxX + bias) / wy
    if (yAtMinX >= bounds.minY && yAtMinX <= bounds.maxY) {
      candidates.push({ x: bounds.minX, y: yAtMinX })
    }
    if (yAtMaxX >= bounds.minY && yAtMaxX <= bounds.maxY) {
      candidates.push({ x: bounds.maxX, y: yAtMaxX })
    }
  }

  if (Math.abs(wx) > 1e-6) {
    const xAtMinY = -(wy * bounds.minY + bias) / wx
    const xAtMaxY = -(wy * bounds.maxY + bias) / wx
    if (xAtMinY >= bounds.minX && xAtMinY <= bounds.maxX) {
      candidates.push({ x: xAtMinY, y: bounds.minY })
    }
    if (xAtMaxY >= bounds.minX && xAtMaxY <= bounds.maxX) {
      candidates.push({ x: xAtMaxY, y: bounds.maxY })
    }
  }

  const unique = candidates.filter(
    (candidate, index, array) =>
      array.findIndex(
        (item) =>
          Math.abs(item.x - candidate.x) < 1e-6 &&
          Math.abs(item.y - candidate.y) < 1e-6,
      ) === index,
  )

  if (unique.length < 2) {
    return [
      { x: bounds.minX, y: 0 },
      { x: bounds.maxX, y: 0 },
    ]
  }

  let bestPair: [Point2D, Point2D] = [unique[0], unique[1]]
  let maxDistance = 0

  for (let i = 0; i < unique.length; i += 1) {
    for (let j = i + 1; j < unique.length; j += 1) {
      const dx = unique[i].x - unique[j].x
      const dy = unique[i].y - unique[j].y
      const distance = dx * dx + dy * dy
      if (distance > maxDistance) {
        maxDistance = distance
        bestPair = [unique[i], unique[j]]
      }
    }
  }

  return bestPair
}

export function formatNumber(value: number, digits = 2) {
  return `${value >= 0 ? '' : '−'}${Math.abs(value).toFixed(digits)}`
}
