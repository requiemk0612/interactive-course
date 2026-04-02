import type { HiddenUnitConfig, LabeledPoint, Point2D } from '../types'
import { pointInPolygon, rotatePoint } from '../lib/geometry'

export const mapBounds = {
  minX: -4.5,
  maxX: 4.5,
  minY: -4.5,
  maxY: 4.5,
}

const rotation = (28 * Math.PI) / 180
const halfWidth = 1.65
const halfHeight = 1.15

const corners = [
  { x: -halfWidth, y: -halfHeight },
  { x: halfWidth, y: -halfHeight },
  { x: halfWidth, y: halfHeight },
  { x: -halfWidth, y: halfHeight },
]

export const safePolygon: Point2D[] = corners.map((point) => rotatePoint(point, rotation))

const rawPoints: Point2D[] = []

for (let y = -4; y <= 4; y += 1) {
  for (let x = -4; x <= 4; x += 1) {
    if ((Math.abs(x) + Math.abs(y)) % 2 === 0 || (x === 0 && y === 0)) {
      rawPoints.push({ x: x + (y % 2 === 0 ? 0.12 : -0.15), y: y * 0.9 })
    }
  }
}

export const samplePoints: LabeledPoint[] = rawPoints.map((point, index) => ({
  id: `p-${index + 1}`,
  ...point,
  isSafe: pointInPolygon(point, safePolygon),
}))

export const defaultProbePoint: Point2D = { x: 2.6, y: -1.15 }

export const demoHiddenUnits: HiddenUnitConfig[] = [
  {
    id: 'H1',
    angle: rotation,
    offset: halfWidth,
    side: -1,
    label: 'H1',
    accent: '#60a5fa',
  },
  {
    id: 'H2',
    angle: rotation,
    offset: -halfWidth,
    side: 1,
    label: 'H2',
    accent: '#67e8f9',
  },
  {
    id: 'H3',
    angle: rotation + Math.PI / 2,
    offset: halfHeight,
    side: -1,
    label: 'H3',
    accent: '#86efac',
  },
  {
    id: 'H4',
    angle: rotation + Math.PI / 2,
    offset: -halfHeight,
    side: 1,
    label: 'H4',
    accent: '#f9a8d4',
  },
]

export const initialBuildUnits: HiddenUnitConfig[] = [
  { ...demoHiddenUnits[0], offset: halfWidth + 0.45 },
  { ...demoHiddenUnits[1], offset: -halfWidth - 0.35 },
  { ...demoHiddenUnits[2], offset: halfHeight + 0.35 },
  { ...demoHiddenUnits[3], offset: -halfHeight - 0.4 },
]

export const activationLinearDemo = {
  hiddenUnits: demoHiddenUnits,
  outputWeights: [1.15, -0.6, 0.9, -0.5],
  outputBias: -0.25,
}
