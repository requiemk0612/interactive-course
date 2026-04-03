import { useEffect, useMemo, useRef, useState } from 'react'
import {
  activationLinearDemo,
  demoHiddenUnits,
  mapBounds,
  safePolygon,
  samplePoints,
} from '../data/dataset'
import {
  clamp,
  formatNumber,
  fromSvgToModel,
  getLineEndpoints,
  toSvgX,
  toSvgY,
} from '../lib/geometry'
import {
  getBinaryLabel,
  getChallengeScore,
  getHiddenActivation,
  getLinearCollapsedBoundary,
  getUnitWeights,
  scoreBuildNetwork,
} from '../lib/networkMath'
import type {
  ActivationMode,
  ChallengeModel,
  FocusTarget,
  GuideMode,
  HiddenUnitConfig,
  HiddenUnitId,
  InspectorState,
  LessonStageId,
  Point2D,
} from '../types'
import { HintBubble } from './HintBubble'

const size = 520

type LandingMapCanvasProps = {
  stageId: LessonStageId
  model: ChallengeModel
  onChangeModel: (patch: Partial<ChallengeModel>) => void
  challengeChecked: boolean
  probePoint: Point2D
  onChangeProbePoint: (point: Point2D) => void
  selectedHiddenUnitId: HiddenUnitId
  activationMode: ActivationMode
  intuitionView: boolean
  buildUnits: HiddenUnitConfig[]
  selectedBuildUnitId: HiddenUnitId
  onChangeBuildUnit: (id: HiddenUnitId, patch: Partial<HiddenUnitConfig>) => void
  onSelectBuildUnit: (id: HiddenUnitId) => void
  buildThreshold: number
  buildScore: number
  traceTestOne: boolean
  traceWeight: number
  traceApplied: boolean
  teacherMode: boolean
  guidedMode: GuideMode
  focusTarget: FocusTarget
  showStageIntroDemo: boolean
  missionReplaySelection: string
  onSetInspector: (inspector: InspectorState | null) => void
}

type DragState =
  | { type: 'challenge-line' }
  | { type: 'probe' }
  | { type: 'build-offset'; id: HiddenUnitId }
  | { type: 'build-angle'; id: HiddenUnitId }
  | null

export function LandingMapCanvas({
  stageId,
  model,
  onChangeModel,
  challengeChecked,
  probePoint,
  onChangeProbePoint,
  selectedHiddenUnitId,
  activationMode,
  intuitionView,
  buildUnits,
  selectedBuildUnitId,
  onChangeBuildUnit,
  onSelectBuildUnit,
  buildThreshold,
  buildScore,
  traceTestOne,
  traceWeight,
  traceApplied,
  teacherMode,
  guidedMode,
  focusTarget,
  showStageIntroDemo,
  missionReplaySelection,
  onSetInspector,
}: LandingMapCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [dragState, setDragState] = useState<DragState>(null)
  const [hoverPoint, setHoverPoint] = useState<Point2D | null>(null)
  const [challengeDemoBias, setChallengeDemoBias] = useState(model.bias)
  const [ghostProbePoint, setGhostProbePoint] = useState<Point2D | null>(null)

  useEffect(() => {
    if (!(guidedMode === 'guided' && stageId === 'challenge' && showStageIntroDemo)) {
      setChallengeDemoBias(model.bias)
      return
    }

    const startedAt = window.performance.now()
    const timer = window.setInterval(() => {
      const elapsed = window.performance.now() - startedAt
      const phase = Math.min(elapsed / 3000, 1)
      setChallengeDemoBias(-1.2 + Math.sin(phase * Math.PI * 2) * 1.8)
    }, 32)

    return () => {
      window.clearInterval(timer)
      setChallengeDemoBias(model.bias)
    }
  }, [guidedMode, model.bias, showStageIntroDemo, stageId])

  useEffect(() => {
    if (!(guidedMode === 'guided' && stageId === 'io' && showStageIntroDemo)) {
      setGhostProbePoint(null)
      return
    }

    const path = [
      { x: 2.6, y: -1.2 },
      { x: 1.2, y: 0.8 },
      { x: -1.4, y: 1.9 },
      { x: -2.2, y: -1.3 },
    ]
    const startedAt = window.performance.now()
    const timer = window.setInterval(() => {
      const elapsed = window.performance.now() - startedAt
      const phase = Math.min(elapsed / 2600, 1)
      const segment = Math.min(path.length - 2, Math.floor(phase * (path.length - 1)))
      const localT = phase * (path.length - 1) - segment
      const from = path[segment]
      const to = path[Math.min(path.length - 1, segment + 1)]

      setGhostProbePoint({
        x: from.x + (to.x - from.x) * localT,
        y: from.y + (to.y - from.y) * localT,
      })
    }, 32)

    return () => {
      window.clearInterval(timer)
      setGhostProbePoint(null)
    }
  }, [guidedMode, showStageIntroDemo, stageId])

  const polygonPath =
    safePolygon
      .map((point, index) =>
        `${index === 0 ? 'M' : 'L'} ${toSvgX(point.x, size, mapBounds.minX, mapBounds.maxX)} ${toSvgY(point.y, size, mapBounds.minY, mapBounds.maxY)}`,
      )
      .join(' ') + ' Z'

  const liveChallengeLine = getLineEndpoints(model.wx, model.wy, model.bias, mapBounds)
  const demoChallengeLine = getLineEndpoints(model.wx, model.wy, challengeDemoBias, mapBounds)
  const collapsedLinearBoundary = getLinearCollapsedBoundary(
    activationLinearDemo.hiddenUnits,
    activationLinearDemo.outputWeights,
    activationLinearDemo.outputBias,
  )
  const collapsedLine = getLineEndpoints(
    collapsedLinearBoundary.wx,
    collapsedLinearBoundary.wy,
    collapsedLinearBoundary.bias,
    mapBounds,
  )

  const fieldCells = useMemo(() => {
    const cells: Array<{ x: number; y: number; intensity: number; color: string }> = []

    for (let y = 0; y < 18; y += 1) {
      for (let x = 0; x < 18; x += 1) {
        const point = {
          x: mapBounds.minX + ((x + 0.5) / 18) * (mapBounds.maxX - mapBounds.minX),
          y: mapBounds.minY + ((y + 0.5) / 18) * (mapBounds.maxY - mapBounds.minY),
        }

        if (stageId === 'activation') {
          if (activationMode === 'off') {
            const linearScore =
              collapsedLinearBoundary.wx * point.x +
              collapsedLinearBoundary.wy * point.y +
              collapsedLinearBoundary.bias

            cells.push({
              x: point.x,
              y: point.y,
              intensity: Math.min(1, Math.abs(linearScore) / 2.4),
              color: linearScore >= 0 ? '#60a5fa' : '#f9a8d4',
            })
          } else {
            const intensity = demoHiddenUnits.reduce(
              (sum, unit) => sum + getHiddenActivation(point, unit),
              0,
            )
            cells.push({
              x: point.x,
              y: point.y,
              intensity: Math.min(1, intensity / 4),
              color: '#67e8f9',
            })
          }
        }

        if (['build', 'summary', 'trace'].includes(stageId)) {
          const score = scoreBuildNetwork(point, buildUnits, buildThreshold)
          cells.push({
            x: point.x,
            y: point.y,
            intensity: Math.min(1, Math.abs(score) / 2.4),
            color: score >= 0 ? '#86efac' : '#0f172a',
          })
        }
      }
    }

    return cells
  }, [activationMode, buildThreshold, buildUnits, stageId])

  function getPointerModelPoint(
    event: React.PointerEvent<SVGSVGElement | SVGCircleElement | SVGLineElement>,
  ) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) {
      return { x: 0, y: 0 }
    }

    const px = event.clientX - rect.left
    const py = event.clientY - rect.top

    return fromSvgToModel(
      px,
      py,
      rect.width,
      rect.height,
      mapBounds.minX,
      mapBounds.maxX,
      mapBounds.minY,
      mapBounds.maxY,
    )
  }

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    const point = getPointerModelPoint(event)
    setHoverPoint(point)

    if (!dragState) {
      return
    }

    if (dragState.type === 'probe') {
      onChangeProbePoint({
        x: clamp(point.x, mapBounds.minX, mapBounds.maxX),
        y: clamp(point.y, mapBounds.minY, mapBounds.maxY),
      })
      return
    }

    if (dragState.type === 'challenge-line') {
      onChangeModel({
        bias: -(model.wx * point.x + model.wy * point.y),
      })
      return
    }

    const unit = buildUnits.find((item) => item.id === dragState.id)
    if (!unit) {
      return
    }

    if (dragState.type === 'build-offset') {
      onChangeBuildUnit(unit.id, {
        offset: Math.cos(unit.angle) * point.x + Math.sin(unit.angle) * point.y,
      })
      return
    }

    const center = {
      x: Math.cos(unit.angle) * unit.offset,
      y: Math.sin(unit.angle) * unit.offset,
    }
    const directionAngle = Math.atan2(point.y - center.y, point.x - center.x) - Math.PI / 2

    onChangeBuildUnit(unit.id, { angle: directionAngle })
  }

  function openMapInspector(point: Point2D) {
    onSetInspector({
      title: '坐标查看',
      subtitle: '二维落点地图',
      x: 74,
      y: 10,
      lines: [
        { label: 'x 坐标', value: formatNumber(point.x) },
        { label: 'y 坐标', value: formatNumber(point.y) },
      ],
      interpretation:
        '坐标平面中的每个点都代表一个候选落点。中间倾斜的紧凑多边形区域代表安全降落区。',
    })
  }

  function getBuildUnitOpacity(unitId: HiddenUnitId) {
    if (stageId !== 'build' || guidedMode !== 'guided') {
      return 1
    }

    const focusMap: Record<string, HiddenUnitId> = {
      'build-unit-h1': 'H1',
      'build-unit-h2': 'H2',
      'build-unit-h3': 'H3',
      'build-unit-h4': 'H4',
    }
    const focused = focusMap[String(focusTarget)]
    if (!focused) {
      return 1
    }
    return unitId === focused ? 1 : 0.34
  }

  function getSummaryReplayLabel() {
    switch (missionReplaySelection) {
      case 'input-output-roles':
        return '重播中：输入先更新坐标，输出再给出判断。'
      case 'hidden-detectors':
        return '重播中：隐藏单元先构造中间检测器。'
      case 'activation-expressive':
        return '重播中：激活让中间检测器在不同区域做出不同响应。'
      default:
        return '重播中：一个直接规则无法完整分开当前安全区。'
    }
  }

  return (
    <div className="glass-panel panel-grid relative h-full min-h-[460px] rounded-[28px] border border-white/8 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.22em] text-slate-400">二维落点地图</p>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300/90">
            这是一个无人机二维落点是否安全的决策模拟，不是完整飞行物理仿真。地图与网络是同一计算过程的两种视图。
          </p>
        </div>
        {stageId === 'build' && buildScore > 0.84 ? (
          <div className="rounded-full border border-emerald-300/18 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-50/90">
            当前网络已经能较稳定地围出安全区。
          </div>
        ) : null}
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${size} ${size}`}
          className="h-[360px] w-full rounded-[24px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.84),rgba(2,6,23,0.98))]"
          onPointerMove={handlePointerMove}
          onPointerUp={() => setDragState(null)}
          onPointerLeave={() => setDragState(null)}
          role="img"
          aria-label="无人机二维落点安全地图"
        >
          <defs>
            <pattern id="map-grid" width="34" height="34" patternUnits="userSpaceOnUse">
              <path
                d="M 34 0 L 0 0 0 34"
                fill="none"
                stroke="rgba(148,163,184,0.08)"
                strokeWidth="1"
                strokeDasharray="3 8"
              />
            </pattern>
          </defs>

          <rect width={size} height={size} fill="url(#map-grid)" />

          {fieldCells.map((cell) => (
            <rect
              key={`${cell.x}-${cell.y}`}
              x={toSvgX(cell.x, size, mapBounds.minX, mapBounds.maxX) - 14}
              y={toSvgY(cell.y, size, mapBounds.minY, mapBounds.maxY) - 14}
              width={28}
              height={28}
              rx={8}
              fill={cell.color}
              opacity={
                stageId === 'activation' && activationMode === 'off'
                  ? 0.08 + cell.intensity * 0.14
                  : 0.04 + cell.intensity * 0.18
              }
            />
          ))}

          <path
            d={polygonPath}
            fill="rgba(103,232,249,0.12)"
            stroke="rgba(103,232,249,0.7)"
            strokeWidth={2.3}
          />

          {stageId === 'challenge' ? (
            <>
              {showStageIntroDemo ? (
                <line
                  x1={toSvgX(demoChallengeLine[0].x, size, mapBounds.minX, mapBounds.maxX)}
                  y1={toSvgY(demoChallengeLine[0].y, size, mapBounds.minY, mapBounds.maxY)}
                  x2={toSvgX(demoChallengeLine[1].x, size, mapBounds.minX, mapBounds.maxX)}
                  y2={toSvgY(demoChallengeLine[1].y, size, mapBounds.minY, mapBounds.maxY)}
                  stroke="rgba(251,191,36,0.7)"
                  strokeWidth={4}
                  strokeLinecap="round"
                />
              ) : null}
              <line
                x1={toSvgX(liveChallengeLine[0].x, size, mapBounds.minX, mapBounds.maxX)}
                y1={toSvgY(liveChallengeLine[0].y, size, mapBounds.minY, mapBounds.maxY)}
                x2={toSvgX(liveChallengeLine[1].x, size, mapBounds.minX, mapBounds.maxX)}
                y2={toSvgY(liveChallengeLine[1].y, size, mapBounds.minY, mapBounds.maxY)}
                stroke="#60a5fa"
                strokeWidth={4}
                strokeLinecap="round"
                className="boundary-travel"
              />
              <line
                x1={toSvgX(liveChallengeLine[0].x, size, mapBounds.minX, mapBounds.maxX)}
                y1={toSvgY(liveChallengeLine[0].y, size, mapBounds.minY, mapBounds.maxY)}
                x2={toSvgX(liveChallengeLine[1].x, size, mapBounds.minX, mapBounds.maxX)}
                y2={toSvgY(liveChallengeLine[1].y, size, mapBounds.minY, mapBounds.maxY)}
                stroke="transparent"
                strokeWidth={24}
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId)
                  setDragState({ type: 'challenge-line' })
                }}
              />
            </>
          ) : null}

          {stageId === 'activation' && activationMode === 'off' ? (
            <line
              x1={toSvgX(collapsedLine[0].x, size, mapBounds.minX, mapBounds.maxX)}
              y1={toSvgY(collapsedLine[0].y, size, mapBounds.minY, mapBounds.maxY)}
              x2={toSvgX(collapsedLine[1].x, size, mapBounds.minX, mapBounds.maxX)}
              y2={toSvgY(collapsedLine[1].y, size, mapBounds.minY, mapBounds.maxY)}
              stroke="#fcd34d"
              strokeWidth={5}
              strokeLinecap="round"
            />
          ) : null}

          {['hidden', 'activation'].includes(stageId)
            ? demoHiddenUnits.map((unit) => {
                const weights = getUnitWeights(unit)
                const segment = getLineEndpoints(weights.wx, weights.wy, weights.bias, mapBounds)
                const isSelected = unit.id === selectedHiddenUnitId
                const opacity =
                  stageId === 'hidden' ? (isSelected ? 1 : 0.22) : isSelected ? 0.92 : 0.48

                return (
                  <g key={unit.id} opacity={opacity}>
                    <line
                      x1={toSvgX(segment[0].x, size, mapBounds.minX, mapBounds.maxX)}
                      y1={toSvgY(segment[0].y, size, mapBounds.minY, mapBounds.maxY)}
                      x2={toSvgX(segment[1].x, size, mapBounds.minX, mapBounds.maxX)}
                      y2={toSvgY(segment[1].y, size, mapBounds.minY, mapBounds.maxY)}
                      stroke={unit.accent}
                      strokeWidth={isSelected ? 4 : 2}
                      strokeDasharray={stageId === 'activation' ? '9 8' : '0'}
                    />
                  </g>
                )
              })
            : null}

          {['build', 'summary', 'trace'].includes(stageId)
            ? buildUnits.map((unit) => {
                const weights = getUnitWeights(unit)
                const segment = getLineEndpoints(weights.wx, weights.wy, weights.bias, mapBounds)
                const isSelected = unit.id === selectedBuildUnitId
                const center = {
                  x: Math.cos(unit.angle) * unit.offset,
                  y: Math.sin(unit.angle) * unit.offset,
                }
                const rotateHandle = {
                  x: center.x - Math.sin(unit.angle) * 1.15,
                  y: center.y + Math.cos(unit.angle) * 1.15,
                }
                const opacity = getBuildUnitOpacity(unit.id)

                return (
                  <g key={unit.id} opacity={opacity}>
                    <line
                      x1={toSvgX(segment[0].x, size, mapBounds.minX, mapBounds.maxX)}
                      y1={toSvgY(segment[0].y, size, mapBounds.minY, mapBounds.maxY)}
                      x2={toSvgX(segment[1].x, size, mapBounds.minX, mapBounds.maxX)}
                      y2={toSvgY(segment[1].y, size, mapBounds.minY, mapBounds.maxY)}
                      stroke={isSelected ? unit.accent : 'rgba(148,163,184,0.52)'}
                      strokeWidth={isSelected ? 4 : 2.2}
                      strokeLinecap="round"
                      onClick={() => onSelectBuildUnit(unit.id)}
                    />

                    {stageId === 'build' ? (
                      <>
                        <circle
                          cx={toSvgX(center.x, size, mapBounds.minX, mapBounds.maxX)}
                          cy={toSvgY(center.y, size, mapBounds.minY, mapBounds.maxY)}
                          r={isSelected ? 6.5 : 5.5}
                          fill={unit.accent}
                          opacity={0.92}
                          onPointerDown={(event) => {
                            event.currentTarget.setPointerCapture(event.pointerId)
                            onSelectBuildUnit(unit.id)
                            setDragState({ type: 'build-offset', id: unit.id })
                          }}
                        />
                        <circle
                          cx={toSvgX(rotateHandle.x, size, mapBounds.minX, mapBounds.maxX)}
                          cy={toSvgY(rotateHandle.y, size, mapBounds.minY, mapBounds.maxY)}
                          r={isSelected ? 6 : 5}
                          fill="rgba(248,250,252,0.95)"
                          stroke={unit.accent}
                          strokeWidth={2}
                          onPointerDown={(event) => {
                            event.currentTarget.setPointerCapture(event.pointerId)
                            onSelectBuildUnit(unit.id)
                            setDragState({ type: 'build-angle', id: unit.id })
                          }}
                        />
                      </>
                    ) : null}
                  </g>
                )
              })
            : null}

          {samplePoints.map((point) => {
            const svgX = toSvgX(point.x, size, mapBounds.minX, mapBounds.maxX)
            const svgY = toSvgY(point.y, size, mapBounds.minY, mapBounds.maxY)
            const challengePredictionLabel = getChallengeScore(point, model) >= 0
            const misclassified =
              challengeChecked && challengePredictionLabel !== point.isSafe && stageId === 'challenge'
            const buildPrediction = scoreBuildNetwork(point, buildUnits, buildThreshold) >= 0

            return (
              <g key={point.id}>
                {misclassified ? (
                  <circle
                    cx={svgX}
                    cy={svgY}
                    r={12}
                    fill="none"
                    stroke="rgba(252,211,77,0.45)"
                    strokeWidth={2}
                    className="pulse-flow"
                  />
                ) : null}
                <circle
                  cx={svgX}
                  cy={svgY}
                  r={point.isSafe ? 6 : 5}
                  fill={point.isSafe ? '#67e8f9' : '#f9a8d4'}
                  stroke={
                    stageId === 'build' || stageId === 'trace' || stageId === 'summary'
                      ? buildPrediction === point.isSafe
                        ? 'rgba(255,255,255,0.18)'
                        : '#fcd34d'
                      : '#08111f'
                  }
                  strokeWidth={
                    misclassified ||
                    ((stageId === 'build' || stageId === 'trace' || stageId === 'summary') &&
                      buildPrediction !== point.isSafe)
                      ? 3
                      : 1.5
                  }
                  opacity={misclassified ? 1 : 0.9}
                  onMouseEnter={() => openMapInspector(point)}
                />
              </g>
            )
          })}

          {['io', 'build', 'trace', 'summary'].includes(stageId) ? (
            <g>
              <circle
                cx={toSvgX(probePoint.x, size, mapBounds.minX, mapBounds.maxX)}
                cy={toSvgY(probePoint.y, size, mapBounds.minY, mapBounds.maxY)}
                r={10}
                fill="rgba(248,250,252,0.95)"
                stroke="#fcd34d"
                strokeWidth={3}
              />
              <circle
                cx={toSvgX(probePoint.x, size, mapBounds.minX, mapBounds.maxX)}
                cy={toSvgY(probePoint.y, size, mapBounds.minY, mapBounds.maxY)}
                r={20}
                fill="none"
                stroke="rgba(252,211,77,0.26)"
                strokeWidth={2}
                className="pulse-flow"
              />
              <circle
                cx={toSvgX(probePoint.x, size, mapBounds.minX, mapBounds.maxX)}
                cy={toSvgY(probePoint.y, size, mapBounds.minY, mapBounds.maxY)}
                r={26}
                fill="transparent"
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId)
                  setDragState({ type: 'probe' })
                }}
              />
            </g>
          ) : null}

          {ghostProbePoint ? (
            <g pointerEvents="none">
              <circle
                cx={toSvgX(ghostProbePoint.x, size, mapBounds.minX, mapBounds.maxX)}
                cy={toSvgY(ghostProbePoint.y, size, mapBounds.minY, mapBounds.maxY)}
                r={14}
                fill="none"
                stroke="rgba(252,211,77,0.55)"
                strokeWidth={2}
                strokeDasharray="4 6"
              />
            </g>
          ) : null}

          {stageId === 'trace' && traceTestOne ? (
            <g>
              <circle cx={286} cy={66} r={12} fill="#fcd34d" opacity={0.95} />
              <text x={286} y={70} textAnchor="middle" className="fill-ink-950 text-[12px] font-bold">
                H5
              </text>
              <line x1={286} y1={78} x2={420} y2={252} stroke="#fcd34d" strokeWidth={3} strokeDasharray="8 6" />
            </g>
          ) : null}

          {stageId === 'trace' && traceApplied ? (
            <g>
              <line x1={68} y1={168} x2={278} y2={192} stroke="#fcd34d" strokeWidth={4} />
              <circle cx={278} cy={192} r={18} fill="none" stroke="#fcd34d" strokeWidth={3} className="pulse-flow" />
              <circle cx={458} cy={252} r={18} fill="none" stroke="#86efac" strokeWidth={3} className="pulse-flow" />
            </g>
          ) : null}

          {hoverPoint ? (
            <g pointerEvents="none">
              <rect
                x={12}
                y={12}
                width={168}
                height={44}
                rx={14}
                fill="rgba(8,17,31,0.84)"
                stroke="rgba(148,163,184,0.18)"
              />
              <text x={24} y={30} className="fill-slate-100 text-[12px] font-mono">
                x {formatNumber(hoverPoint.x)}
              </text>
              <text x={24} y={46} className="fill-slate-400 text-[12px] font-mono">
                y {formatNumber(hoverPoint.y)}
              </text>
            </g>
          ) : null}
        </svg>

        {stageId === 'challenge' ? (
          <div className="absolute left-4 top-4">
            <div className="rounded-[18px] border border-white/10 bg-[rgba(7,12,22,0.72)] px-3 py-3 text-xs text-slate-200/90 backdrop-blur-xl">
              <div className="mb-2 text-[11px] tracking-[0.2em] text-slate-400">图例</div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-300" />
                <span>安全样本点</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-pink-300" />
                <span>不安全样本点</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="h-0.5 w-4 rounded-full bg-sky-300" />
                <span>决策边界</span>
              </div>
            </div>
          </div>
        ) : null}

        {guidedMode === 'guided' && stageId === 'challenge' && showStageIntroDemo ? (
          <div className="absolute left-1/2 top-4 -translate-x-1/2">
            <HintBubble tone="strong">先看一眼：一个直接规则总会漏掉一些点。</HintBubble>
          </div>
        ) : null}

        {guidedMode === 'guided' &&
        stageId === 'challenge' &&
        !showStageIntroDemo &&
        !challengeChecked ? (
          <div className="absolute right-4 top-16 max-w-xs">
            <HintBubble>现在轮到你，拖动边界看看能不能做得更好。</HintBubble>
          </div>
        ) : null}

        {guidedMode === 'guided' && stageId === 'io' && !showStageIntroDemo ? (
          <div className="absolute left-1/2 top-5 -translate-x-1/2">
            <HintBubble>拖动我，看看一个位置怎样变成一个判断。</HintBubble>
          </div>
        ) : null}

        {guidedMode === 'guided' && stageId === 'trace' && !traceApplied ? (
          <div className="absolute right-4 top-5 max-w-xs">
            <HintBubble>你正在修改进入某个隐藏单元的一条权重，观察影响如何向后传播。</HintBubble>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300/90">
        <div className="rounded-full border border-white/8 bg-black/20 px-3 py-1">
          中间倾斜多边形代表安全降落区
        </div>
        {stageId === 'io' ? (
          <div className="rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1 text-cyan-50/90">
            当前探针点判断：{getBinaryLabel(getChallengeScore(probePoint, model))}
          </div>
        ) : null}
        {stageId === 'activation' ? (
          <div className="rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1 text-cyan-50/90">
            {activationMode === 'off'
              ? '关闭：多层线性仍等价于一个整体线性规则'
              : '开启：隐藏单元会在不同区域做出不同响应'}
          </div>
        ) : null}
        {stageId === 'activation' && intuitionView ? (
          <div className="rounded-full border border-sky-300/18 bg-sky-300/10 px-3 py-1 text-sky-50/90">
            当前显示的是“简化理解视图”，只用于帮助建立直觉。
          </div>
        ) : null}
        {stageId === 'build' ? (
          <div className="rounded-full border border-amber-300/18 bg-amber-300/10 px-3 py-1 text-amber-50/90">
            Remaining mismatches：{samplePoints.length - Math.round(buildScore * samplePoints.length)}
          </div>
        ) : null}
        {stageId === 'trace' && traceApplied ? (
          <div className="rounded-full border border-emerald-300/18 bg-emerald-300/10 px-3 py-1 text-emerald-50/90">
            当前示例权重为 {formatNumber(traceWeight)}。预激活值已经改变，后续输出也可能改变，但输入本身没有被反向修改。
          </div>
        ) : null}
        {stageId === 'summary' ? (
          <div className="rounded-full border border-white/8 bg-black/20 px-3 py-1 text-slate-200/90">
            {getSummaryReplayLabel()}
          </div>
        ) : null}
        {teacherMode && stageId === 'activation' ? (
          <div className="rounded-full border border-sky-300/18 bg-sky-300/10 px-3 py-1 text-sky-50/90">
            教师模式：主视图保持 ReLU 风格连续响应，不把激活错误地画成硬阈值分类器。
          </div>
        ) : null}
      </div>
    </div>
  )
}
