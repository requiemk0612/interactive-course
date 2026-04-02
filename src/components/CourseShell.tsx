import clsx from 'clsx'
import { ChapterRail } from './ChapterRail'
import { ConceptPanel } from './ConceptPanel'
import { InspectorPopover } from './InspectorPopover'
import { LandingMapCanvas } from './LandingMapCanvas'
import { NetworkVisualization } from './NetworkVisualization'
import { formatNumber } from '../lib/geometry'
import type {
  ActivationMode,
  ChallengeModel,
  ConceptCard,
  HiddenUnitConfig,
  HiddenUnitId,
  InspectorState,
  LessonStageId,
  LessonStageMeta,
  Point2D,
  UnderstandingProfile,
} from '../types'

type CourseShellProps = {
  meta: {
    courseTitle: string
    lessonTag: string
    lessonTitle: string
    lessonNarrative: string
  }
  stage: LessonStageMeta
  stageIndex: number
  stages: LessonStageMeta[]
  currentStageId: LessonStageId
  teacherMode: boolean
  onToggleTeacherMode: (value: boolean) => void
  onReset: () => void
  onNext: () => void
  onPrevious: () => void
  onSelectStage: (stageId: LessonStageId) => void
  conceptCards: ConceptCard[]
  challengeModel: ChallengeModel
  onChangeChallengeModel: (patch: Partial<ChallengeModel>) => void
  challengePrediction: 'yes' | 'no' | 'unsure' | null
  onChoosePrediction: (value: 'yes' | 'no' | 'unsure') => void
  challengeChecked: boolean
  onRunChallenge: () => void
  probePoint: Point2D
  onChangeProbePoint: (point: Point2D) => void
  selectedHiddenUnitId: HiddenUnitId
  onSelectHiddenUnit: (id: HiddenUnitId) => void
  activationMode: ActivationMode
  onChangeActivationMode: (mode: ActivationMode) => void
  intuitionView: boolean
  onToggleIntuitionView: (value: boolean) => void
  buildUnits: HiddenUnitConfig[]
  onChangeBuildUnit: (id: HiddenUnitId, patch: Partial<HiddenUnitConfig>) => void
  selectedBuildUnitId: HiddenUnitId
  onSelectBuildUnit: (id: HiddenUnitId) => void
  buildThreshold: number
  onChangeBuildThreshold: (value: number) => void
  buildPlaySeed: number
  onPlayBuildFlow: () => void
  buildGuideStep: number
  onStepBuildGuide: () => void
  onResetBuildNetwork: () => void
  onAutofillBuildDemo: () => void
  buildScore: number
  inspector: InspectorState | null
  onSetInspector: (inspector: InspectorState | null) => void
  highlightEdgeId: string | null
  onHighlightEdge: (id: string | null) => void
  traceAnswerOne: string | null
  onSelectTraceAnswerOne: (value: string) => void
  traceTestOne: boolean
  onRunTraceTestOne: () => void
  traceAnswerTwo: string | null
  onSelectTraceAnswerTwo: (value: string) => void
  traceWeight: number
  onSetTraceWeight: (value: number) => void
  traceApplied: boolean
  onApplyTraceWeight: () => void
  understandingProfile: UnderstandingProfile
}

export function CourseShell({
  meta,
  stage,
  stageIndex,
  stages,
  currentStageId,
  teacherMode,
  onToggleTeacherMode,
  onReset,
  onNext,
  onPrevious,
  onSelectStage,
  conceptCards,
  challengeModel,
  onChangeChallengeModel,
  challengePrediction,
  onChoosePrediction,
  challengeChecked,
  onRunChallenge,
  probePoint,
  onChangeProbePoint,
  selectedHiddenUnitId,
  onSelectHiddenUnit,
  activationMode,
  onChangeActivationMode,
  intuitionView,
  onToggleIntuitionView,
  buildUnits,
  onChangeBuildUnit,
  selectedBuildUnitId,
  onSelectBuildUnit,
  buildThreshold,
  onChangeBuildThreshold,
  buildPlaySeed,
  onPlayBuildFlow,
  buildGuideStep,
  onStepBuildGuide,
  onResetBuildNetwork,
  onAutofillBuildDemo,
  buildScore,
  inspector,
  onSetInspector,
  highlightEdgeId,
  onHighlightEdge,
  traceAnswerOne,
  onSelectTraceAnswerOne,
  traceTestOne,
  onRunTraceTestOne,
  traceAnswerTwo,
  onSelectTraceAnswerTwo,
  traceWeight,
  onSetTraceWeight,
  traceApplied,
  onApplyTraceWeight,
  understandingProfile,
}: CourseShellProps) {
  const isFirst = stageIndex === 0
  const isLast = stageIndex === stages.length - 1
  const selectedBuildUnit =
    buildUnits.find((unit) => unit.id === selectedBuildUnitId) ?? buildUnits[0]

  return (
    <div className="min-h-screen text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-ink-950/85 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-5 px-4 py-4 lg:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">
                完整互动式教学课件作品
              </p>
              <h1 className="mt-2 font-display text-2xl leading-tight tracking-wide text-slate-50 lg:text-3xl">
                {meta.courseTitle}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                <span className="rounded-full border border-slate-700 bg-white/5 px-3 py-1">
                  {meta.lessonTag} · {meta.lessonTitle}
                </span>
                <span className="text-slate-400">{meta.lessonNarrative}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-slate-700 bg-white/5 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">
                  本单元进度
                </div>
                <div className="mt-1 font-display text-lg text-slate-50">
                  {stage.stepNumber} / {stages.length}
                </div>
              </div>
              <button
                type="button"
                className="rounded-2xl border border-slate-700 bg-white/5 px-4 py-3 text-sm text-slate-100 transition hover:border-slate-500 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                onClick={onReset}
              >
                重新开始
              </button>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-white/5 px-4 py-3 text-sm text-slate-200">
                <span>教师模式</span>
                <button
                  type="button"
                  aria-pressed={teacherMode}
                  onClick={() => onToggleTeacherMode(!teacherMode)}
                  className={clsx(
                    'relative h-7 w-14 rounded-full border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300',
                    teacherMode
                      ? 'border-cyan-300/40 bg-cyan-300/18'
                      : 'border-slate-700 bg-slate-900',
                  )}
                >
                  <span
                    className={clsx(
                      'absolute top-1 h-5 w-5 rounded-full bg-white transition',
                      teacherMode ? 'left-8' : 'left-1',
                    )}
                  />
                </button>
              </label>
            </div>
          </div>

          <div className="xl:hidden">
            <div className="soft-scrollbar flex gap-3 overflow-x-auto pb-2">
              {stages.map((item) => {
                const active = item.id === currentStageId
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectStage(item.id)}
                    className={clsx(
                      'min-w-[180px] rounded-2xl border px-4 py-3 text-left',
                      active
                        ? 'border-sky-300/60 bg-sky-300/15'
                        : 'border-slate-700 bg-slate-900/65',
                    )}
                  >
                    <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                      {item.stepNumber.toString().padStart(2, '0')}
                    </div>
                    <div className="mt-1 font-display text-sm">{item.titleZh}</div>
                    <div className="mt-1 text-xs text-slate-400">{item.titleEn}</div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1800px] grid-cols-1 gap-6 px-4 py-6 lg:px-6 xl:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden xl:block">
          <ChapterRail
            stages={stages}
            currentStageId={currentStageId}
            onSelectStage={onSelectStage}
          />
        </aside>

        <section className="space-y-6">
          <div className="glass-panel rounded-[32px] border border-slate-700/70">
            <div className="border-b border-slate-700/70 px-5 py-5 lg:px-7">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-4xl">
                  <p className="text-xs uppercase tracking-[0.26em] text-cyan-300/80">
                    {stage.titleZh} · {stage.titleEn}
                  </p>
                  <h2 className="mt-2 font-display text-2xl tracking-wide text-slate-50 lg:text-3xl">
                    {stage.headline}
                  </h2>
                  <p className="mt-3 max-w-4xl text-base leading-7 text-slate-300">
                    {stage.description}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
                  按顺序体验 7 个教学环节，也可以从左侧直接切换
                </div>
              </div>

              <div className="mt-5">{renderStageToolbar()}</div>
            </div>

            <div className="grid grid-cols-1 gap-6 p-5 lg:p-7 2xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="relative">
                  <NetworkVisualization
                    stageId={currentStageId}
                    model={challengeModel}
                    onChangeChallengeModel={onChangeChallengeModel}
                    probePoint={probePoint}
                    selectedHiddenUnitId={selectedHiddenUnitId}
                    onSelectHiddenUnit={onSelectHiddenUnit}
                    buildUnits={buildUnits}
                    selectedBuildUnitId={selectedBuildUnitId}
                    onSelectBuildUnit={onSelectBuildUnit}
                    buildThreshold={buildThreshold}
                    buildGuideStep={buildGuideStep}
                    buildPlaySeed={buildPlaySeed}
                    teacherMode={teacherMode}
                    highlightEdgeId={highlightEdgeId}
                    onHighlightEdge={onHighlightEdge}
                    onSetInspector={onSetInspector}
                  />
                  <InspectorPopover inspector={inspector} onClose={() => onSetInspector(null)} />
                </div>

                <LandingMapCanvas
                  stageId={currentStageId}
                  model={challengeModel}
                  onChangeModel={onChangeChallengeModel}
                  challengeChecked={challengeChecked}
                  probePoint={probePoint}
                  onChangeProbePoint={onChangeProbePoint}
                  selectedHiddenUnitId={selectedHiddenUnitId}
                  activationMode={activationMode}
                  intuitionView={intuitionView}
                  buildUnits={buildUnits}
                  selectedBuildUnitId={selectedBuildUnitId}
                  onChangeBuildUnit={onChangeBuildUnit}
                  onSelectBuildUnit={onSelectBuildUnit}
                  buildThreshold={buildThreshold}
                  buildScore={buildScore}
                  traceTestOne={traceTestOne}
                  traceWeight={traceWeight}
                  traceApplied={traceApplied}
                  teacherMode={teacherMode}
                  onSetInspector={onSetInspector}
                />
              </div>

              <ConceptPanel
                stage={stage}
                cards={conceptCards}
                understandingProfile={understandingProfile}
              />
            </div>

            {currentStageId === 'build' ? (
              <div className="border-t border-slate-700/70 px-5 py-5 lg:px-7">
                <div className="rounded-[26px] border border-slate-700/70 bg-slate-950/55 p-5">
                  <div className="grid gap-5 xl:grid-cols-[1fr_240px]">
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-[0.24em] text-slate-400">
                            当前选中的检测器
                          </div>
                          <div className="mt-1 font-display text-lg text-slate-50">
                            {selectedBuildUnit.label} 控制面板
                          </div>
                        </div>
                        <div className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-sm text-slate-300">
                          输出阈值 {formatNumber(buildThreshold)}
                        </div>
                      </div>
                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <label className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-200">
                          <span className="mb-2 block">角度</span>
                          <input
                            type="range"
                            min={-3.14}
                            max={3.14}
                            step={0.01}
                            value={selectedBuildUnit.angle}
                            onChange={(event) =>
                              onChangeBuildUnit(selectedBuildUnit.id, {
                                angle: Number(event.target.value),
                              })
                            }
                            className="w-full accent-sky-300"
                          />
                          <span className="mt-2 block font-mono text-xs text-slate-400">
                            {formatNumber(selectedBuildUnit.angle)}
                          </span>
                        </label>
                        <label className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-200">
                          <span className="mb-2 block">偏移</span>
                          <input
                            type="range"
                            min={-3.5}
                            max={3.5}
                            step={0.02}
                            value={selectedBuildUnit.offset}
                            onChange={(event) =>
                              onChangeBuildUnit(selectedBuildUnit.id, {
                                offset: Number(event.target.value),
                              })
                            }
                            className="w-full accent-sky-300"
                          />
                          <span className="mt-2 block font-mono text-xs text-slate-400">
                            {formatNumber(selectedBuildUnit.offset)}
                          </span>
                        </label>
                        <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-200">
                          <span className="mb-3 block">响应方向</span>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              className={clsx(
                                'rounded-xl border px-3 py-3 text-xs',
                                selectedBuildUnit.side === 1
                                  ? 'border-sky-300/40 bg-sky-300/15 text-sky-100'
                                  : 'border-slate-700 bg-slate-900 text-slate-300',
                              )}
                              onClick={() =>
                                onChangeBuildUnit(selectedBuildUnit.id, { side: 1 })
                              }
                            >
                              更偏向这一侧
                            </button>
                            <button
                              type="button"
                              className={clsx(
                                'rounded-xl border px-3 py-3 text-xs',
                                selectedBuildUnit.side === -1
                                  ? 'border-sky-300/40 bg-sky-300/15 text-sky-100'
                                  : 'border-slate-700 bg-slate-900 text-slate-300',
                              )}
                              onClick={() =>
                                onChangeBuildUnit(selectedBuildUnit.id, { side: -1 })
                              }
                            >
                              更偏向另一侧
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                      <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                        输出层阈值
                      </div>
                      <input
                        type="range"
                        min={1.2}
                        max={4.2}
                        step={0.05}
                        value={buildThreshold}
                        onChange={(event) => onChangeBuildThreshold(Number(event.target.value))}
                        className="mt-4 w-full accent-mint-300"
                      />
                      <div className="mt-3 font-mono text-sm text-slate-200">
                        {formatNumber(buildThreshold)}
                      </div>
                      <p className="mt-3 text-xs leading-5 text-slate-400">
                        阈值越高，输出层越严格，只有更多隐藏响应同时出现时才会判定为安全。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="border-t border-slate-700/70 px-5 py-4 lg:px-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-slate-400">
                  本作品聚焦一个完整知识单元，通过 7 个教学环节完成一次完整学习闭环。
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onPrevious}
                    disabled={isFirst}
                    className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    上一步
                  </button>
                  <button
                    type="button"
                    onClick={onNext}
                    disabled={isLast}
                    className="rounded-2xl border border-sky-300/40 bg-sky-300/15 px-4 py-3 text-sm text-sky-50 transition hover:bg-sky-300/20 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    下一步
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )

  function renderStageToolbar() {
    if (currentStageId === 'challenge') {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              ['yes', '是的，一条直线就够了'],
              ['no', '不是，一条直线不够'],
              ['unsure', '我还不确定'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => onChoosePrediction(key as 'yes' | 'no' | 'unsure')}
                className={clsx(
                  'rounded-full border px-4 py-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300',
                  challengePrediction === key
                    ? 'border-sky-300/50 bg-sky-300/15 text-sky-50'
                    : 'border-slate-700 bg-slate-900/65 text-slate-300 hover:border-slate-500',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center">
            <button
              type="button"
              disabled={!challengePrediction}
              onClick={onRunChallenge}
              className="rounded-full border border-cyan-300/45 bg-cyan-300/15 px-5 py-2 text-sm text-cyan-50 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-45"
            >
              运行检验
            </button>
          </div>
        </div>
      )
    }

    if (currentStageId === 'activation') {
      return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex rounded-full border border-slate-700 bg-slate-950/60 p-1">
            {[
              ['off', '关闭激活'],
              ['relu', '开启激活'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => onChangeActivationMode(key as ActivationMode)}
                className={clsx(
                  'rounded-full px-4 py-2 text-sm transition',
                  activationMode === key
                    ? 'bg-sky-300/18 text-sky-50'
                    : 'text-slate-300 hover:bg-white/6',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="inline-flex items-center gap-3 rounded-full border border-slate-700 bg-slate-950/60 px-4 py-2 text-sm text-slate-300">
            <span>显示直觉视图</span>
            <button
              type="button"
              aria-pressed={intuitionView}
              className={clsx(
                'relative h-6 w-12 rounded-full border',
                intuitionView ? 'border-cyan-300/40 bg-cyan-300/18' : 'border-slate-700',
              )}
              onClick={() => onToggleIntuitionView(!intuitionView)}
            >
              <span
                className={clsx(
                  'absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white transition',
                  intuitionView ? 'left-7' : 'left-1',
                )}
              />
            </button>
          </label>
        </div>
      )
    }

    if (currentStageId === 'build') {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="rounded-2xl border border-slate-700 bg-slate-950/55 px-4 py-3 text-sm text-slate-200">
              目标：让网络接受安全区内的点，并拒绝安全区外的点。
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onPlayBuildFlow}
                className="rounded-full border border-sky-300/40 bg-sky-300/15 px-4 py-2 text-sm text-sky-50"
              >
                播放流程
              </button>
              <button
                type="button"
                onClick={onStepBuildGuide}
                className="rounded-full border border-slate-700 bg-slate-900/65 px-4 py-2 text-sm text-slate-200"
              >
                分步提示
              </button>
              <button
                type="button"
                onClick={onResetBuildNetwork}
                className="rounded-full border border-slate-700 bg-slate-900/65 px-4 py-2 text-sm text-slate-200"
              >
                重置构造
              </button>
              <button
                type="button"
                onClick={onAutofillBuildDemo}
                className="rounded-full border border-mint-300/40 bg-mint-300/12 px-4 py-2 text-sm text-mint-50"
              >
                自动填充示范
              </button>
            </div>
          </div>
        </div>
      )
    }

    if (currentStageId === 'trace') {
      return (
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-[26px] border border-slate-700 bg-slate-950/60 p-4">
            <p className="text-sm text-slate-300">
              第一个子任务：新增一个隐藏单元。你预测哪一部分会受到影响？
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                '只有输出节点会变化',
                '所有已有隐藏单元都会变化',
                '包括输入层在内的所有节点都会变化',
              ].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onSelectTraceAnswerOne(option)}
                  className={clsx(
                    'rounded-full border px-4 py-2 text-sm',
                    traceAnswerOne === option
                      ? 'border-sky-300/40 bg-sky-300/15 text-sky-50'
                      : 'border-slate-700 bg-slate-900 text-slate-300',
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={!traceAnswerOne}
              onClick={onRunTraceTestOne}
              className="mt-4 rounded-full border border-cyan-300/40 bg-cyan-300/15 px-4 py-2 text-sm text-cyan-50 disabled:cursor-not-allowed disabled:opacity-45"
            >
              测试改动
            </button>
          </div>

          <div className="rounded-[26px] border border-slate-700 bg-slate-950/60 p-4">
            <p className="text-sm text-slate-300">
              第二个子任务：选中 x → H2 这条连接。若权重发生变化，哪些值可能随之改变？
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                '只有被选中的隐藏单元会变化',
                '被选中的隐藏单元以及后续部分可能变化',
                '整个网络所有部分都会变化',
              ].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onSelectTraceAnswerTwo(option)}
                  className={clsx(
                    'rounded-full border px-4 py-2 text-sm',
                    traceAnswerTwo === option
                      ? 'border-sky-300/40 bg-sky-300/15 text-sky-50'
                      : 'border-slate-700 bg-slate-900 text-slate-300',
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <input
                type="range"
                min={-1.4}
                max={1.6}
                step={0.05}
                value={traceWeight}
                onChange={(event) => onSetTraceWeight(Number(event.target.value))}
                className="flex-1 accent-amber-300"
              />
              <span className="min-w-16 font-mono text-sm text-slate-100">
                {formatNumber(traceWeight)}
              </span>
            </div>
            <button
              type="button"
              disabled={!traceAnswerTwo}
              onClick={onApplyTraceWeight}
              className="mt-4 rounded-full border border-amber-300/40 bg-amber-300/12 px-4 py-2 text-sm text-amber-50 disabled:cursor-not-allowed disabled:opacity-45"
            >
              应用改动
            </button>
          </div>
        </div>
      )
    }

    if (currentStageId === 'summary') {
      return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [
              '输入层（Input layer）',
              '它承载当前样本的描述信息，这里就是无人机落点的 x、y 坐标。',
            ],
            [
              '隐藏层（Hidden layer）',
              '它把原始输入转成更容易组合的中间特征或局部几何测试。',
            ],
            [
              '激活函数（Activation function）',
              '它引入非线性，让隐藏单元在不同区域做出不同响应。',
            ],
            [
              '输出层（Output layer）',
              '它把隐藏响应组合成最终的安全或不安全判断。',
            ],
          ].map(([title, body]) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-4"
            >
              <h3 className="font-display text-base tracking-wide text-slate-50">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
            </div>
          ))}
        </div>
      )
    }

    return null
  }
}
