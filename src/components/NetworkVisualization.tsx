import { useMemo } from 'react'
import { demoHiddenUnits } from '../data/dataset'
import { formatNumber } from '../lib/geometry'
import {
  getBinaryLabel,
  getChallengeScore,
  getHiddenSnapshot,
  getUnitWeights,
  scoreBuildNetwork,
} from '../lib/networkMath'
import type {
  ChallengeModel,
  FocusTarget,
  GuideMode,
  HiddenUnitConfig,
  HiddenUnitId,
  InspectorState,
  LessonStageId,
  Point2D,
} from '../types'

const inputPositions = {
  x: { x: 12, y: 34 },
  y: { x: 12, y: 66 },
}

const hiddenPositions: Record<HiddenUnitId, { x: number; y: number }> = {
  H1: { x: 52, y: 16 },
  H2: { x: 52, y: 37 },
  H3: { x: 52, y: 58 },
  H4: { x: 52, y: 79 },
}

const outputPosition = { x: 88, y: 48 }

type NetworkVisualizationProps = {
  stageId: LessonStageId
  model: ChallengeModel
  onChangeChallengeModel: (patch: Partial<ChallengeModel>) => void
  probePoint: Point2D
  selectedHiddenUnitId: HiddenUnitId
  onSelectHiddenUnit: (id: HiddenUnitId) => void
  buildUnits: HiddenUnitConfig[]
  selectedBuildUnitId: HiddenUnitId
  onSelectBuildUnit: (id: HiddenUnitId) => void
  buildThreshold: number
  buildPlaySeed: number
  teacherMode: boolean
  guidedMode: GuideMode
  focusTarget: FocusTarget
  highlightEdgeId: string | null
  onHighlightEdge: (id: string | null) => void
  onSetInspector: (inspector: InspectorState | null) => void
}

export function NetworkVisualization({
  stageId,
  model,
  onChangeChallengeModel,
  probePoint,
  selectedHiddenUnitId,
  onSelectHiddenUnit,
  buildUnits,
  selectedBuildUnitId,
  onSelectBuildUnit,
  buildThreshold,
  buildPlaySeed,
  teacherMode,
  guidedMode,
  focusTarget,
  highlightEdgeId,
  onHighlightEdge,
  onSetInspector,
}: NetworkVisualizationProps) {
  const showHiddenLayer = !['challenge', 'io'].includes(stageId)
  const currentScore = getChallengeScore(probePoint, model)
  const buildScore = useMemo(
    () => scoreBuildNetwork(probePoint, buildUnits, buildThreshold),
    [probePoint, buildUnits, buildThreshold],
  )
  const networkLabel = stageId === 'build' || stageId === 'trace' || stageId === 'summary'
    ? getBinaryLabel(buildScore)
    : getBinaryLabel(currentScore)

  const activeHiddenUnit =
    stageId === 'build' || stageId === 'trace' || stageId === 'summary'
      ? buildUnits.find((unit) => unit.id === selectedBuildUnitId) ?? buildUnits[0]
      : demoHiddenUnits.find((unit) => unit.id === selectedHiddenUnitId) ?? demoHiddenUnits[0]

  const hiddenSnapshot = getHiddenSnapshot(probePoint, activeHiddenUnit, activeHiddenUnit.id)

  function openInputInspector(key: 'x' | 'y') {
    const position = inputPositions[key]
    onSetInspector({
      title: key === 'x' ? '输入节点 x' : '输入节点 y',
      subtitle: '输入层（Input layer）',
      x: position.x,
      y: position.y,
      lines: [
        { label: '当前数值', value: formatNumber(probePoint[key]) },
        { label: '节点角色', value: '坐标输入' },
      ],
      interpretation: '输入层不负责解决问题，它只负责把当前落点坐标送入网络。',
    })
  }

  function openOutputInspector() {
    const stageScore =
      stageId === 'build' || stageId === 'trace' || stageId === 'summary'
        ? buildScore
        : currentScore
    onSetInspector({
      title: '输出节点 · 降落评分',
      subtitle: '输出层（Output layer）',
      x: outputPosition.x,
      y: outputPosition.y,
      lines: [
        { label: '当前评分', value: formatNumber(stageScore) },
        { label: '最终判断', value: networkLabel },
        { label: '决策阈值', value: stageId === 'challenge' || stageId === 'io' ? '0.00' : formatNumber(buildThreshold) },
      ],
      interpretation: '输出层把前面的内部响应组合起来，形成最终的安全或不安全判断。',
    })
  }

  function openHiddenInspector(unit: HiddenUnitConfig) {
    const position = hiddenPositions[unit.id]
    const snapshot = getHiddenSnapshot(probePoint, unit, unit.id)
    const weights = getUnitWeights(unit)
    onSetInspector({
      title: `${unit.label} · 隐藏单元`,
      subtitle: '中间检测器（Intermediate detector）',
      x: position.x,
      y: position.y,
      lines: [
        { label: '预激活值', value: formatNumber(snapshot.preActivation) },
        { label: '激活值', value: formatNumber(snapshot.activation) },
        { label: '偏置', value: formatNumber(weights.bias) },
      ],
      interpretation: snapshot.interpretation,
    })
  }

  function openEdgeInspector(edgeId: string, weight: number, x: number, y: number) {
    onHighlightEdge(edgeId)
    onSetInspector({
      title: `连接 · ${edgeId}`,
      subtitle: '带权连接',
      x,
      y,
      lines: [
        { label: '权重', value: formatNumber(weight) },
        { label: '作用', value: '缩放上游信号' },
      ],
      interpretation: '连接权重决定上游信号以多大强度影响下游节点，但影响仍然沿着前向方向传播。',
    })
  }

  function getUnitOpacity(unitId: HiddenUnitId) {
    if (stageId === 'hidden' && guidedMode === 'guided') {
      if (focusTarget === 'hidden-unit-h1') {
        return unitId === 'H1' ? 1 : 0.26
      }
      if (focusTarget === 'hidden-unit-h2') {
        return unitId === 'H2' ? 1 : 0.3
      }
    }

    if (stageId === 'build' && guidedMode === 'guided') {
      const focusMap: Record<string, HiddenUnitId> = {
        'build-unit-h1': 'H1',
        'build-unit-h2': 'H2',
        'build-unit-h3': 'H3',
        'build-unit-h4': 'H4',
      }
      const focusedUnit = focusMap[String(focusTarget)]
      if (focusedUnit) {
        return unitId === focusedUnit ? 1 : 0.34
      }
    }

    return 1
  }

  return (
    <div className="glass-panel panel-grid relative h-full min-h-[460px] overflow-hidden rounded-[28px] border border-white/8 p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.22em] text-slate-400">网络结构视图</p>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300/90">
            {showHiddenLayer
              ? '点击节点查看解释，点击连接查看权重。这里的重点不是记公式，而是看清每个中间响应在整个决策里扮演什么角色。'
              : '此时只有 x、y 直接连到输出节点。网络只能形成一个直接线性规则。'}
          </p>
        </div>
        {stageId === 'hidden' ? (
          <div className="rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-50/90">
            操作提示：一次只看一个隐藏单元
          </div>
        ) : null}
      </div>

      <svg viewBox="0 0 100 100" className="h-[360px] w-full">
        {showHiddenLayer ? (
          <>
            {(['H1', 'H2', 'H3', 'H4'] as HiddenUnitId[]).map((hiddenId) => {
              const position = hiddenPositions[hiddenId]
              const unit =
                stageId === 'build' || stageId === 'trace' || stageId === 'summary'
                  ? buildUnits.find((item) => item.id === hiddenId) ?? buildUnits[0]
                  : demoHiddenUnits.find((item) => item.id === hiddenId) ?? demoHiddenUnits[0]
              const edgeWeightX = getUnitWeights(unit).wx
              const edgeWeightY = getUnitWeights(unit).wy
              const opacity = getUnitOpacity(hiddenId)

              return (
                <g key={hiddenId} opacity={opacity}>
                  {[
                    {
                      id: `x-${hiddenId}`,
                      x1: inputPositions.x.x,
                      y1: inputPositions.x.y,
                      x2: position.x,
                      y2: position.y,
                      weight: edgeWeightX,
                    },
                    {
                      id: `y-${hiddenId}`,
                      x1: inputPositions.y.x,
                      y1: inputPositions.y.y,
                      x2: position.x,
                      y2: position.y,
                      weight: edgeWeightY,
                    },
                    {
                      id: `${hiddenId}-out`,
                      x1: position.x,
                      y1: position.y,
                      x2: outputPosition.x,
                      y2: outputPosition.y,
                      weight: 1,
                    },
                  ].map((edge) => (
                    <g key={edge.id}>
                      <line
                        x1={edge.x1}
                        y1={edge.y1}
                        x2={edge.x2}
                        y2={edge.y2}
                        stroke={
                          highlightEdgeId === edge.id
                            ? edge.id.endsWith('out')
                              ? '#86efac'
                              : '#67e8f9'
                            : 'rgba(148,163,184,0.5)'
                        }
                        strokeWidth={highlightEdgeId === edge.id ? 1.1 : 0.65}
                      />
                      <line
                        x1={edge.x1}
                        y1={edge.y1}
                        x2={edge.x2}
                        y2={edge.y2}
                        stroke="transparent"
                        strokeWidth={6}
                        onClick={() =>
                          openEdgeInspector(
                            edge.id,
                            edge.weight,
                            (edge.x1 + edge.x2) / 2,
                            (edge.y1 + edge.y2) / 2,
                          )
                        }
                        onMouseEnter={() => onHighlightEdge(edge.id)}
                        onMouseLeave={() => onHighlightEdge(null)}
                      />
                    </g>
                  ))}
                </g>
              )
            })}
          </>
        ) : (
          <>
            <line
              x1={inputPositions.x.x}
              y1={inputPositions.x.y}
              x2={outputPosition.x}
              y2={outputPosition.y}
              stroke="rgba(148,163,184,0.6)"
              strokeWidth={0.9}
            />
            <line
              x1={inputPositions.y.x}
              y1={inputPositions.y.y}
              x2={outputPosition.x}
              y2={outputPosition.y}
              stroke="rgba(148,163,184,0.6)"
              strokeWidth={0.9}
            />
          </>
        )}

        {(['x', 'y'] as const).map((key) => {
          const position = inputPositions[key]
          return (
            <g key={key}>
              <circle cx={position.x} cy={position.y} r={6.8} className="fill-slate-100" />
              <text
                x={position.x}
                y={position.y + 0.5}
                textAnchor="middle"
                className="fill-ink-950 text-[4px] font-bold"
              >
                {key}
              </text>
              <text
                x={position.x}
                y={position.y + 12}
                textAnchor="middle"
                className="fill-slate-300 text-[3px] font-mono"
              >
                {formatNumber(probePoint[key])}
              </text>
              <circle cx={position.x} cy={position.y} r={9} fill="transparent" onClick={() => openInputInspector(key)} />
            </g>
          )
        })}

        {showHiddenLayer
          ? (stageId === 'build' || stageId === 'trace' || stageId === 'summary' ? buildUnits : demoHiddenUnits).map(
              (unit, index) => {
                const position = hiddenPositions[unit.id]
                const isSelected =
                  stageId === 'build' || stageId === 'trace' || stageId === 'summary'
                    ? selectedBuildUnitId === unit.id
                    : selectedHiddenUnitId === unit.id
                const opacity = getUnitOpacity(unit.id)

                return (
                  <g key={unit.id} opacity={opacity}>
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r={isSelected ? 7.4 : 6.6}
                      fill={isSelected ? unit.accent : 'rgba(226,232,240,0.92)'}
                      className={buildPlaySeed % 2 === index % 2 ? 'pulse-flow' : ''}
                    />
                    {isSelected ? (
                      <circle
                        cx={position.x}
                        cy={position.y}
                        r={10.2}
                        fill="none"
                        stroke={unit.accent}
                        strokeWidth={1.6}
                        opacity={0.35}
                      />
                    ) : null}
                    <text
                      x={position.x}
                      y={position.y + 0.5}
                      textAnchor="middle"
                      className="fill-ink-950 text-[3.8px] font-bold"
                    >
                      {unit.id}
                    </text>
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r={9}
                      fill="transparent"
                      onClick={() => {
                        if (stageId === 'build' || stageId === 'trace' || stageId === 'summary') {
                          onSelectBuildUnit(unit.id)
                        } else {
                          onSelectHiddenUnit(unit.id)
                        }
                        openHiddenInspector(unit)
                      }}
                    />
                  </g>
                )
              },
            )
          : null}

        <g>
          <circle cx={outputPosition.x} cy={outputPosition.y} r={7.4} fill="#f8fafc" />
          <text
            x={outputPosition.x}
            y={outputPosition.y + 0.5}
            textAnchor="middle"
            className="fill-ink-950 text-[3.5px] font-bold"
          >
            out
          </text>
          <circle cx={outputPosition.x} cy={outputPosition.y} r={10} fill="transparent" onClick={openOutputInspector} />
          <text
            x={outputPosition.x}
            y={outputPosition.y + 13}
            textAnchor="middle"
            className="fill-slate-100 text-[3.5px]"
          >
            降落评分
          </text>
          <text
            x={outputPosition.x}
            y={outputPosition.y + 18}
            textAnchor="middle"
            className="fill-slate-300 text-[3px]"
          >
            {networkLabel}
          </text>
        </g>
      </svg>

      {stageId === 'challenge' ? (
        <div className="absolute bottom-4 left-4 right-4 rounded-[22px] border border-white/8 bg-black/30 p-4">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['wx', 'x 的权重', model.wx, -2.5, 2.5, 0.05],
              ['wy', 'y 的权重', model.wy, -2.5, 2.5, 0.05],
              ['bias', '偏置', model.bias, -4, 4, 0.05],
            ].map(([key, labelText, value, min, max, step]) => (
              <label key={String(key)} className="text-sm text-slate-200/90">
                <span className="mb-2 block">{labelText}</span>
                <input
                  type="range"
                  min={Number(min)}
                  max={Number(max)}
                  step={Number(step)}
                  value={Number(value)}
                  onChange={(event) =>
                    onChangeChallengeModel({
                      [key]: Number(event.target.value),
                    } as Partial<ChallengeModel>)
                  }
                  aria-label={String(labelText)}
                  className="w-full accent-sky-300"
                />
                <span className="mt-1 block font-mono text-xs text-slate-400">
                  {formatNumber(Number(value))}
                </span>
              </label>
            ))}
          </div>
          {teacherMode ? (
            <div className="mt-4 inline-flex rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1 font-mono text-xs text-cyan-100/90">
              score = {formatNumber(model.wx)}x + {formatNumber(model.wy)}y + {formatNumber(model.bias)}，阈值为 0
            </div>
          ) : null}
        </div>
      ) : null}

      {showHiddenLayer ? (
        <div className="absolute bottom-4 left-4 right-4 rounded-[22px] border border-white/8 bg-black/30 p-4 text-sm text-slate-200/90">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-display tracking-[0.03em] text-slate-100">
                {activeHiddenUnit.id} 当前状态
              </div>
              <div className="mt-1 text-xs leading-6 text-slate-400">{hiddenSnapshot.interpretation}</div>
            </div>
            <div className="flex gap-3 font-mono text-xs text-slate-300">
              <span>预激活值 {formatNumber(hiddenSnapshot.preActivation)}</span>
              <span>激活值 {formatNumber(hiddenSnapshot.activation)}</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
