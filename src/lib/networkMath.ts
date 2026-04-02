import type {
  ChallengeModel,
  HiddenUnitConfig,
  HiddenUnitId,
  Point2D,
} from '../types'

export function getChallengeScore(point: Point2D, model: ChallengeModel) {
  return model.wx * point.x + model.wy * point.y + model.bias
}

export function getBinaryLabel(score: number) {
  return score >= 0 ? '可安全降落' : '不安全'
}

export function getUnitWeights(unit: HiddenUnitConfig) {
  const wx = unit.side * Math.cos(unit.angle)
  const wy = unit.side * Math.sin(unit.angle)
  const bias = -unit.side * unit.offset

  return { wx, wy, bias }
}

export function getHiddenPreActivation(point: Point2D, unit: HiddenUnitConfig) {
  const { wx, wy, bias } = getUnitWeights(unit)
  return wx * point.x + wy * point.y + bias
}

export function relu(value: number) {
  return Math.max(0, value)
}

export function getScaledActivation(value: number) {
  return Math.min(1.25, relu(value))
}

export function getHiddenActivation(point: Point2D, unit: HiddenUnitConfig) {
  return getScaledActivation(getHiddenPreActivation(point, unit))
}

export function scoreBuildNetwork(
  point: Point2D,
  units: HiddenUnitConfig[],
  threshold: number,
) {
  const activationSum = units.reduce(
    (sum, unit) => sum + getHiddenActivation(point, unit),
    0,
  )
  return activationSum - threshold
}

export function getHiddenSnapshot(
  point: Point2D,
  unit: HiddenUnitConfig,
  id: HiddenUnitId,
) {
  const preActivation = getHiddenPreActivation(point, unit)
  const activation = getScaledActivation(preActivation)
  const sideText = unit.side === 1 ? '更偏向这一侧响应' : '更偏向另一侧响应'

  return {
    id,
    preActivation,
    activation,
    interpretation:
      activation > 0
        ? `这个中间检测器在当前位置处于活跃状态，并且${sideText}。`
        : '这个中间检测器在当前位置尚未被激活。',
  }
}

export function getLinearCollapsedBoundary(
  units: HiddenUnitConfig[],
  outputWeights: number[],
  outputBias: number,
) {
  return units.reduce(
    (accumulator, unit, index) => {
      const weights = getUnitWeights(unit)
      return {
        wx: accumulator.wx + weights.wx * outputWeights[index],
        wy: accumulator.wy + weights.wy * outputWeights[index],
        bias: accumulator.bias + weights.bias * outputWeights[index],
      }
    },
    { wx: 0, wy: 0, bias: outputBias },
  )
}
