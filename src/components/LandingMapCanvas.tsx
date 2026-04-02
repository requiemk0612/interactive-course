import { useMemo, useRef, useState } from 'react'
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
  HiddenUnitConfig,
  HiddenUnitId,
  InspectorState,
  LessonStageId,
  Point2D,
} from '../types'

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
  onSetInspector,
}: LandingMapCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [dragState, setDragState] = useState<DragState>(null)
  const [hoverPoint, setHoverPoint] = useState<Point2D | null>(null)

  const polygonPath =
    safePolygon
      .map((point, index) =>
        `${index === 0 ? 'M' : 'L'} ${toSvgX(point.x, size, mapBounds.minX, mapBounds.maxX)} ${toSvgY(point.y, size, mapBounds.minY, mapBounds.maxY)}`,
      )
      .join(' ') + ' Z'

  const challengeLine = getLineEndpoints(model.wx, model.wy, model.bias, mapBounds)
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

        if (['build', 'summary'].includes(stageId)) {
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
    const directionAngle =
      Math.atan2(point.y - center.y, point.x - center.x) - Math.PI / 2

    onChangeBuildUnit(unit.id, { angle: directionAngle })
  }

  function openMapInspector(point: Point2D) {
    onSetInspector({
      title: '坐标查看',
      subtitle: '降落区域地图',
      x: 74,
      y: 10,
      lines: [
        { label: 'x 坐标', value: formatNumber(point.x) },
        { label: 'y 坐标', value: formatNumber(point.y) },
      ],
      interpretation: '坐标平面中的每个点都代表一个潜在落点，安全区位于中央倾斜的紧凑多边形区域中。',
    })
  }

  return (
    <div className="glass-panel panel-grid relative h-full min-h-[460px] rounded-[28px] border border-slate-700/70 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">降落区域地图</p>
          <p className="mt-2 text-sm text-slate-300">
            悬停可查看坐标，拖动探针点或边界控制点可以观察决策变化。
          </p>
        </div>
        {stageId === 'build' && buildScore > 0.84 ? (
          <div className="rounded-full border border-mint-300/35 bg-mint-300/10 px-3 py-1 text-xs text-mint-100">
            当前网络已经利用多个简单的区域检测器，形成了更丰富的决策边界。
          </div>
        ) : null}
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${size} ${size}`}
        className="h-[360px] w-full rounded-[24px] border border-slate-800 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.9),rgba(2,6,23,0.98))]"
        onPointerMove={handlePointerMove}
        onPointerUp={() => setDragState(null)}
        onPointerLeave={() => setDragState(null)}
        role="img"
        aria-label="无人机安全降落区域地图"
      >
        <defs>
          <pattern id="map-grid" width="34" height="34" patternUnits="userSpaceOnUse">
            <path
              d="M 34 0 L 0 0 0 34"
              fill="none"
              stroke="rgba(148,163,184,0.12)"
              strokeWidth="1"
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
                ? 0.12 + cell.intensity * 0.18
                : 0.06 + cell.intensity * 0.22
            }
          />
        ))}

        <path
          d={polygonPath}
          fill="rgba(103,232,249,0.12)"
          stroke="rgba(103,232,249,0.75)"
          strokeWidth={2.5}
        />

        {stageId === 'challenge' ? (
          <>
            <line
              x1={toSvgX(challengeLine[0].x, size, mapBounds.minX, mapBounds.maxX)}
              y1={toSvgY(challengeLine[0].y, size, mapBounds.minY, mapBounds.maxY)}
              x2={toSvgX(challengeLine[1].x, size, mapBounds.minX, mapBounds.maxX)}
              y2={toSvgY(challengeLine[1].y, size, mapBounds.minY, mapBounds.maxY)}
              stroke="#60a5fa"
              strokeWidth={4}
              strokeLinecap="round"
            />
            <line
              x1={toSvgX(challengeLine[0].x, size, mapBounds.minX, mapBounds.maxX)}
              y1={toSvgY(challengeLine[0].y, size, mapBounds.minY, mapBounds.maxY)}
              x2={toSvgX(challengeLine[1].x, size, mapBounds.minX, mapBounds.maxX)}
              y2={toSvgY(challengeLine[1].y, size, mapBounds.minY, mapBounds.maxY)}
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
            opacity={0.85}
          />
        ) : null}

        {['hidden', 'activation'].includes(stageId)
          ? demoHiddenUnits.map((unit) => {
              const weights = getUnitWeights(unit)
              const segment = getLineEndpoints(weights.wx, weights.wy, weights.bias, mapBounds)
              const isSelected = unit.id === selectedHiddenUnitId

              return (
                <g key={unit.id} opacity={stageId === 'hidden' ? (isSelected ? 1 : 0.26) : 0.66}>
                  <line
                    x1={toSvgX(segment[0].x, size, mapBounds.minX, mapBounds.maxX)}
                    y1={toSvgY(segment[0].y, size, mapBounds.minY, mapBounds.maxY)}
                    x2={toSvgX(segment[1].x, size, mapBounds.minX, mapBounds.maxX)}
                    y2={toSvgY(segment[1].y, size, mapBounds.minY, mapBounds.maxY)}
                    stroke={unit.accent}
                    strokeWidth={isSelected ? 4 : 2}
                    strokeDasharray={stageId === 'activation' ? '10 8' : '0'}
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

              return (
                <g
                  key={unit.id}
                  opacity={stageId === 'trace' && unit.id === 'H4' && !traceTestOne ? 0.42 : 1}
                >
                  <line
                    x1={toSvgX(segment[0].x, size, mapBounds.minX, mapBounds.maxX)}
                    y1={toSvgY(segment[0].y, size, mapBounds.minY, mapBounds.maxY)}
                    x2={toSvgX(segment[1].x, size, mapBounds.minX, mapBounds.maxX)}
                    y2={toSvgY(segment[1].y, size, mapBounds.minY, mapBounds.maxY)}
                    stroke={isSelected ? unit.accent : 'rgba(148,163,184,0.55)'}
                    strokeWidth={isSelected ? 4 : 2.4}
                    strokeLinecap="round"
                    onClick={() => onSelectBuildUnit(unit.id)}
                  />
                  {stageId === 'build' ? (
                    <>
                      <circle
                        cx={toSvgX(center.x, size, mapBounds.minX, mapBounds.maxX)}
                        cy={toSvgY(center.y, size, mapBounds.minY, mapBounds.maxY)}
                        r={6}
                        fill={unit.accent}
                        opacity={0.9}
                        onPointerDown={(event) => {
                          event.currentTarget.setPointerCapture(event.pointerId)
                          onSelectBuildUnit(unit.id)
                          setDragState({ type: 'build-offset', id: unit.id })
                        }}
                      />
                      <circle
                        cx={toSvgX(rotateHandle.x, size, mapBounds.minX, mapBounds.maxX)}
                        cy={toSvgY(rotateHandle.y, size, mapBounds.minY, mapBounds.maxY)}
                        r={5}
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
            <circle
              key={point.id}
              cx={svgX}
              cy={svgY}
              r={point.isSafe ? 6 : 5}
              fill={point.isSafe ? '#67e8f9' : '#f9a8d4'}
              stroke={
                stageId === 'build'
                  ? buildPrediction === point.isSafe
                    ? 'rgba(255,255,255,0.2)'
                    : '#fcd34d'
                  : '#08111f'
              }
              strokeWidth={
                misclassified || (stageId === 'build' && buildPrediction !== point.isSafe)
                  ? 3
                  : 1.5
              }
              opacity={misclassified ? 1 : 0.88}
              onMouseEnter={() => openMapInspector(point)}
            />
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
              stroke="rgba(252,211,77,0.3)"
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

        {stageId === 'trace' && traceTestOne ? (
          <g>
            <circle cx={286} cy={66} r={12} fill="#fcd34d" opacity={0.95} />
            <text
              x={286}
              y={70}
              textAnchor="middle"
              className="fill-ink-950 text-[12px] font-bold"
            >
              H5
            </text>
            <line
              x1={286}
              y1={78}
              x2={420}
              y2={252}
              stroke="#fcd34d"
              strokeWidth={3}
              strokeDasharray="8 6"
            />
          </g>
        ) : null}

        {stageId === 'trace' && traceApplied ? (
          <g>
            <line x1={68} y1={168} x2={278} y2={192} stroke="#fcd34d" strokeWidth={4} />
            <circle
              cx={278}
              cy={192}
              r={18}
              fill="none"
              stroke="#fcd34d"
              strokeWidth={3}
              className="pulse-flow"
            />
            <circle
              cx={458}
              cy={252}
              r={18}
              fill="none"
              stroke="#86efac"
              strokeWidth={3}
              className="pulse-flow"
            />
          </g>
        ) : null}

        {hoverPoint ? (
          <g pointerEvents="none">
            <rect
              x={12}
              y={12}
              width={152}
              height={42}
              rx={12}
              fill="rgba(8,17,31,0.9)"
              stroke="rgba(148,163,184,0.3)"
            />
            <text x={24} y={30} className="fill-slate-100 text-[12px]">
              x 坐标 {formatNumber(hoverPoint.x)}
            </text>
            <text x={24} y={46} className="fill-slate-400 text-[12px]">
              y 坐标 {formatNumber(hoverPoint.y)}
            </text>
          </g>
        ) : null}
      </svg>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
        <div className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
          中央倾斜多边形区域代表安全降落区
        </div>
        {stageId === 'io' ? (
          <div className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-cyan-100">
            当前探针点判断：{getBinaryLabel(getChallengeScore(probePoint, model))}
          </div>
        ) : null}
        {stageId === 'activation' && intuitionView ? (
          <div className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-cyan-100">
            直觉视图只做概念辅助：可以粗略理解为“激活 / 未激活”，但主视图仍保持 ReLU 风格的连续响应。
          </div>
        ) : null}
        {stageId === 'trace' && traceApplied ? (
          <div className="rounded-full border border-mint-300/25 bg-mint-300/10 px-3 py-1 text-mint-100">
            当前连接权重已改为 {formatNumber(traceWeight)}，最先变化的是对应隐藏单元，之后才可能影响输出。
          </div>
        ) : null}
        {teacherMode && stageId === 'activation' ? (
          <div className="rounded-full border border-sky-300/25 bg-sky-300/10 px-3 py-1 text-sky-100">
            教师模式说明：关闭激活时显示折叠后的整体线性边界，开启激活时显示隐藏单元的区域响应。
          </div>
        ) : null}
      </div>
    </div>
  )
}
