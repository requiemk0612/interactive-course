import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { demoHiddenUnits } from '../data/dataset'
import {
  getActiveGuideStep,
  getGuideSteps,
  getStageProgress,
  getTaskStrip,
  helpTopics,
  isStageComplete,
  onboardingPanels,
  summaryReplayItems,
} from '../data/guideConfig'
import { formatNumber } from '../lib/geometry'
import { ChapterRail } from './ChapterRail'
import { ConceptPanel } from './ConceptPanel'
import { CurrentTaskStrip } from './CurrentTaskStrip'
import { FeedbackToast } from './FeedbackToast'
import { GuideManager } from './GuideManager'
import { HelpLayer } from './HelpLayer'
import { InspectorPopover } from './InspectorPopover'
import { LandingMapCanvas } from './LandingMapCanvas'
import { MissionProgress } from './MissionProgress'
import { NetworkVisualization } from './NetworkVisualization'
import { OnboardingBriefing } from './OnboardingBriefing'
import type {
  ActivationMode,
  ChallengeModel,
  ConceptCard,
  GuideActionId,
  GuideMode,
  HiddenUnitConfig,
  HiddenUnitId,
  InspectorState,
  LessonStageId,
  LessonStageMeta,
  Point2D,
  UnderstandingProfile,
} from '../types'

type Props = {
  meta: { courseTitle: string; lessonTag: string; lessonTitle: string; lessonNarrative: string }
  stage: LessonStageMeta
  stageIndex: number
  stages: LessonStageMeta[]
  currentStageId: LessonStageId
  teacherMode: boolean
  guidedMode: GuideMode
  showOnboarding: boolean
  helpOpen: boolean
  completedActions: GuideActionId[]
  seenStageIntro: LessonStageId[]
  toastMessage: string | null
  missionReplaySelection: string
  onStartGuidedMode: () => void
  onStartFreeMode: () => void
  onRestartWithGuide: () => void
  onSetHelpOpen: (value: boolean) => void
  onClearToast: () => void
  onMarkStageIntroSeen: (stageId: LessonStageId) => void
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
  onResetBuildNetwork: () => void
  onAutofillBuildDemo: () => void
  buildScore: number
  buildMismatchCount: number
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
  onSetMissionReplaySelection: (value: string) => void
}

const challengePredictionLabels = [
  { id: 'yes', label: '是，一条线足够', note: '我认为直接规则已经够用。' },
  { id: 'no', label: '不，一条线不够', note: '我认为必须用更丰富的结构。' },
  { id: 'unsure', label: '暂时不确定', note: '我想先试一试再下结论。' },
] as const

const traceQuestionOneOptions = [
  { id: 'output-only', label: '只有输出节点', note: '只会影响最后结果，不会影响中间部分。' },
  { id: 'downstream', label: '新增单元及其后续部分', note: '新增单元会影响它自己以及它后面的计算。' },
  { id: 'everything', label: '整张图都会一起变', note: '包括输入值和已有隐藏单元都会被改写。' },
]

const traceQuestionTwoOptions = [
  { id: 'selected-only', label: '只影响这个隐藏单元', note: '变化会停在当前隐藏单元。' },
  { id: 'selected-and-downstream', label: '影响这个隐藏单元及其后续部分', note: '会先影响这个单元，再影响后面依赖它的计算。' },
  { id: 'whole-network', label: '整个网络同时变化', note: '包括更早的输入值也会被改写。' },
]

export function CourseShell(props: Props) {
  const {
    meta,
    stage,
    stageIndex,
    stages,
    currentStageId,
    teacherMode,
    guidedMode,
    showOnboarding,
    helpOpen,
    completedActions,
    seenStageIntro,
    toastMessage,
    missionReplaySelection,
    onStartGuidedMode,
    onStartFreeMode,
    onRestartWithGuide,
    onSetHelpOpen,
    onClearToast,
    onMarkStageIntroSeen,
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
    onResetBuildNetwork,
    onAutofillBuildDemo,
    buildScore,
    buildMismatchCount,
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
    onSetMissionReplaySelection,
  } = props

  const [activationPreviewMode, setActivationPreviewMode] = useState<ActivationMode | null>(null)
  const [showExampleBusy, setShowExampleBusy] = useState(false)

  const guideSteps = getGuideSteps(currentStageId)
  const activeGuideStep = getActiveGuideStep(currentStageId, completedActions)
  const stageProgress = getStageProgress(currentStageId, completedActions)
  const taskStrip = getTaskStrip({
    stageId: currentStageId,
    guideMode: guidedMode,
    completedActions,
  })
  const stageComplete = isStageComplete(currentStageId, completedActions)
  const challengeClosedLoop =
    completedActions.includes('challenge-prediction') &&
    completedActions.includes('challenge-run-check')
  const showStageIntroDemo =
    guidedMode === 'guided' &&
    !seenStageIntro.includes(currentStageId) &&
    (currentStageId === 'challenge' || currentStageId === 'io')
  const unlockedStageIds = useMemo(
    () =>
      guidedMode === 'guided'
        ? stages
            .filter((_, index) => index <= stageIndex + (stageComplete ? 1 : 0))
            .map((item) => item.id)
        : stages.map((item) => item.id),
    [guidedMode, stageComplete, stageIndex, stages],
  )
  const canGoNext =
    stageIndex < stages.length - 1 &&
    (guidedMode === 'guided'
      ? stageComplete
      : currentStageId === 'challenge'
        ? challengeClosedLoop
        : true)
  const selectedBuildUnit =
    buildUnits.find((unit) => unit.id === selectedBuildUnitId) ?? buildUnits[0]
  const effectiveActivationMode = activationPreviewMode ?? activationMode
  const buildFocusMap: Record<string, HiddenUnitId> = {
    'build-unit-h1': 'H1',
    'build-unit-h2': 'H2',
    'build-unit-h3': 'H3',
    'build-unit-h4': 'H4',
  }
  const focusedBuildUnitId = buildFocusMap[String(activeGuideStep?.focusTarget)] ?? null

  useEffect(() => {
    if (guidedMode !== 'guided' || seenStageIntro.includes(currentStageId)) {
      setActivationPreviewMode(null)
      return
    }

    if (currentStageId === 'challenge' || currentStageId === 'io') {
      const timer = window.setTimeout(() => onMarkStageIntroSeen(currentStageId), 3200)
      return () => window.clearTimeout(timer)
    }

    if (currentStageId === 'activation') {
      setActivationPreviewMode('off')
      const timerOne = window.setTimeout(() => setActivationPreviewMode('relu'), 1300)
      const timerTwo = window.setTimeout(() => {
        setActivationPreviewMode(null)
        onMarkStageIntroSeen('activation')
      }, 2600)

      return () => {
        window.clearTimeout(timerOne)
        window.clearTimeout(timerTwo)
        setActivationPreviewMode(null)
      }
    }

    onMarkStageIntroSeen(currentStageId)
    return undefined
  }, [currentStageId, guidedMode, onMarkStageIntroSeen, seenStageIntro])

  useEffect(() => {
    if (guidedMode !== 'guided' || currentStageId !== 'build') {
      return
    }

    const targetUnit = focusedBuildUnitId

    if (targetUnit && targetUnit !== selectedBuildUnitId) {
      onSelectBuildUnit(targetUnit)
    }
  }, [currentStageId, focusedBuildUnitId, guidedMode, onSelectBuildUnit, selectedBuildUnitId])

  function handleSelectStage(stageId: LessonStageId) {
    if (guidedMode === 'guided' && !unlockedStageIds.includes(stageId)) {
      return
    }
    onSelectStage(stageId)
  }

  function handleShowExample() {
    if (showExampleBusy) {
      return
    }

    setShowExampleBusy(true)

    ;(['H1', 'H2', 'H3', 'H4'] as HiddenUnitId[]).forEach((id, index) => {
      window.setTimeout(() => {
        const unit = demoHiddenUnits[index]
        onSelectBuildUnit(id)
        onChangeBuildUnit(id, {
          angle: unit.angle,
          offset: unit.offset,
          side: unit.side,
        })
      }, index * 650)
    })

    window.setTimeout(() => onChangeBuildThreshold(3.15), 4 * 650)
    window.setTimeout(() => onPlayBuildFlow(), 5 * 650)
    window.setTimeout(() => setShowExampleBusy(false), 6 * 650)
  }

  function getFocusClass(target: string, variant: 'strong' | 'soft' = 'soft') {
    const active = activeGuideStep?.focusTarget === target
    if (!active) {
      return ''
    }

    return variant === 'strong'
      ? 'ring-2 ring-cyan-300/60 shadow-[0_0_0_1px_rgba(103,232,249,0.15),0_18px_40px_rgba(14,165,233,0.18)]'
      : 'ring-1 ring-cyan-300/35 shadow-[0_10px_24px_rgba(14,165,233,0.12)]'
  }

  return (
    <div className="min-h-screen text-slate-100">
      <OnboardingBriefing
        open={showOnboarding}
        panels={onboardingPanels}
        onStartGuided={onStartGuidedMode}
        onStartFree={onStartFreeMode}
      />
      <HelpLayer
        open={helpOpen}
        topic={helpTopics[currentStageId]}
        onClose={() => onSetHelpOpen(false)}
      />
      <FeedbackToast message={toastMessage} onClose={onClearToast} />

      <header className="sticky top-0 z-40 border-b border-white/8 bg-ink-950/88 backdrop-blur-2xl">
        <div className="mx-auto max-w-[1820px] px-4 py-4 lg:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-5xl">
              <p className="text-xs tracking-[0.28em] text-cyan-100/68">
                完整互动式教学作品
              </p>
              <h1 className="mt-2 font-display text-[2.05rem] leading-tight tracking-[0.02em] text-slate-100 lg:text-[2.65rem]">
                {meta.courseTitle}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-300/90">
                <span className="rounded-full border border-white/8 bg-white/[0.05] px-3 py-1">
                  {meta.lessonTag} · {meta.lessonTitle}
                </span>
                <span className="max-w-3xl leading-7 text-slate-400">{meta.lessonNarrative}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <MissionProgress
                stageIndex={stageIndex}
                stageTotal={stages.length}
                stepCompleted={guideSteps.length ? stageProgress.currentStepIndex : undefined}
                stepTotal={guideSteps.length ? stageProgress.total : undefined}
              />
              <button
                type="button"
                className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-slate-200/90 transition hover:border-slate-500 hover:bg-white/[0.08]"
                onClick={() => onSetHelpOpen(true)}
              >
                我现在看到的是什么？
              </button>
              <button
                type="button"
                className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-slate-200/90 transition hover:border-slate-500 hover:bg-white/[0.08]"
                onClick={onRestartWithGuide}
              >
                重新开始并进入引导
              </button>
              <button
                type="button"
                className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-slate-200/90 transition hover:border-slate-500 hover:bg-white/[0.08]"
                onClick={onReset}
              >
                重置本单元
              </button>
              <label className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-slate-200/90">
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
                      'absolute top-1 h-5 w-5 rounded-full bg-slate-50 transition',
                      teacherMode ? 'left-8' : 'left-1',
                    )}
                  />
                </button>
              </label>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1820px] grid-cols-1 gap-6 px-4 py-6 lg:px-6 xl:grid-cols-[270px_minmax(0,1fr)]">
        <aside className="hidden xl:block">
          <ChapterRail
            stages={stages}
            currentStageId={currentStageId}
            guideMode={guidedMode}
            unlockedStageIds={unlockedStageIds}
            onSelectStage={handleSelectStage}
          />
        </aside>

        <section className="space-y-6">
          <div className="glass-panel rounded-[36px] border border-white/8">
            <div className="border-b border-white/8 px-5 py-5 lg:px-7">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-4xl">
                  <p className="text-xs tracking-[0.24em] text-cyan-100/72">
                    {stage.titleZh} · {stage.titleEn}
                  </p>
                  <h2 className="mt-2 font-display text-2xl tracking-[0.03em] text-slate-100 lg:text-[2rem]">
                    {stage.headline}
                  </h2>
                  {currentStageId === 'hidden' ? (
                    <p className="mt-3 text-sm leading-7 text-slate-300/90">
                      操作提示：一次只看一个隐藏单元。
                    </p>
                  ) : null}
                  {currentStageId === 'trace' ? (
                    <p className="mt-3 text-sm leading-7 text-slate-300/90">
                      网络已经能工作了，现在来检查一个局部变化会怎样影响后续计算。
                    </p>
                  ) : null}
                  {currentStageId === 'activation' &&
                  guidedMode === 'guided' &&
                  !seenStageIntro.includes('activation') ? (
                    <p className="mt-3 text-sm leading-7 text-amber-100/90">
                      到这里为止，只是增加单元数量仍然不够。
                    </p>
                  ) : null}
                  <p className="mt-3 max-w-4xl text-base leading-8 text-slate-300/90">
                    {stage.description}
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/8 bg-white/[0.04] px-4 py-3 text-sm leading-7 text-slate-300/90">
                  按顺序体验 7 个教学环节，也可以从左侧直接切换。
                </div>
              </div>

              <div className="mt-5">
                <CurrentTaskStrip
                  task={taskStrip}
                  guideMode={guidedMode}
                  stepLabel={
                    guidedMode === 'guided' && guideSteps.length
                      ? `步骤 ${Math.min(stageProgress.currentStepIndex + 1, stageProgress.total)} / ${stageProgress.total}`
                      : null
                  }
                />
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div>{renderToolbar()}</div>
                <GuideManager guideMode={guidedMode} step={activeGuideStep} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 p-5 lg:p-7 2xl:grid-cols-[minmax(0,1fr)_380px]">
              <div className="space-y-6">
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
                      buildPlaySeed={buildPlaySeed}
                      teacherMode={teacherMode}
                      guidedMode={guidedMode}
                      focusTarget={activeGuideStep?.focusTarget ?? null}
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
                    activationMode={effectiveActivationMode}
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
                    guidedMode={guidedMode}
                    focusTarget={activeGuideStep?.focusTarget ?? null}
                    showStageIntroDemo={showStageIntroDemo}
                    missionReplaySelection={missionReplaySelection}
                    onSetInspector={onSetInspector}
                  />
                </div>

                {currentStageId === 'build' ? renderBuildWorkbench() : null}
              </div>

              <ConceptPanel
                stage={stage}
                cards={conceptCards}
                understandingProfile={understandingProfile}
              />
            </div>

            <div className="border-t border-white/8 px-5 py-4 lg:px-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="text-sm leading-7 text-slate-400">
                  本作品围绕一个完整知识点，设计了 7 个连续教学环节，让学习者从“直接规则失败”一路走到“隐藏层与激活函数为何必要”的清晰理解。
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onPrevious}
                    disabled={stageIndex === 0}
                    className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    上一步
                  </button>
                  <button
                    type="button"
                    onClick={onNext}
                    disabled={!canGoNext}
                    className="primary-action rounded-2xl px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {stageIndex === stages.length - 1 ? '已到最后' : '下一步'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )

  function renderToolbar() {
    if (currentStageId === 'challenge') {
      return (
        <div className="rounded-[28px] border border-white/8 bg-white/[0.035] p-4 shadow-[inset_0_0_30px_rgba(148,163,184,0.04)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs tracking-[0.18em] text-slate-400">先做预测，再运行检验</p>
              <p className="mt-2 text-sm leading-7 text-slate-300/90">
                这一页最重要的动作不是“调到完美”，而是完成一次明确的预测—检验闭环。
              </p>
            </div>
            <div className="rounded-full border border-amber-300/18 bg-amber-300/10 px-3 py-1 text-xs text-amber-50/90">
              你现在是在测试模型的极限，不是要立刻找到完美答案。
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-3 text-sm text-slate-200/90">先做预测，再运行检验</p>
            <div className={clsx('grid gap-3 lg:grid-cols-3', getFocusClass('challenge-predictions'))}>
              {challengePredictionLabels.map((item) => {
                const selected = challengePrediction === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onChoosePrediction(item.id)}
                    className={clsx(
                      'rounded-[22px] border px-4 py-4 text-left transition duration-200',
                      selected
                        ? 'border-cyan-300/45 bg-cyan-300/[0.12] text-slate-100 shadow-[0_0_26px_rgba(34,211,238,0.16)]'
                        : 'border-white/8 bg-black/20 text-slate-300/92 hover:border-slate-500 hover:bg-white/[0.05] hover:text-slate-100 active:scale-[0.99]',
                    )}
                  >
                    <div className="font-medium text-inherit">{item.label}</div>
                    <div className="mt-2 text-xs leading-6 text-slate-400">{item.note}</div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm leading-7 text-slate-400">
              {challengeChecked
                ? '你移动的是一条直接决策规则，它仍然无法完整包住安全区。'
                : '选择预测之后，点击最亮的按钮开始检验。'}
            </div>
            <button
              type="button"
              onClick={onRunChallenge}
              disabled={!challengePrediction}
              className={clsx(
                'primary-action rounded-2xl px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-45',
                getFocusClass('challenge-run-check', 'strong'),
              )}
            >
              运行检验
            </button>
          </div>
        </div>
      )
    }

    if (currentStageId === 'io') {
      return (
        <div className="rounded-[28px] border border-white/8 bg-white/[0.035] p-4 shadow-[inset_0_0_30px_rgba(148,163,184,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.18em] text-slate-400">一个位置如何变成一个判断</p>
              <p className="mt-2 text-sm leading-7 text-slate-300/90">
                拖动右侧发光探针点，左侧输入节点和输出节点会同步更新。
              </p>
            </div>
            <div className="rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-50/90">
              提示：你现在改变的是被测试的位置，不是模型参数。
            </div>
          </div>
        </div>
      )
    }

    if (currentStageId === 'hidden') {
      return (
        <div className="rounded-[28px] border border-white/8 bg-white/[0.035] p-4 shadow-[inset_0_0_30px_rgba(148,163,184,0.04)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs tracking-[0.18em] text-slate-400">一次只看一个隐藏单元</p>
              <p className="mt-2 text-sm leading-7 text-slate-300/90">
                先点击 H1，再点击 H2。每个隐藏单元都只是一个中间检测器，不是整个答案。
              </p>
            </div>
            <div className="rounded-full border border-white/8 bg-black/20 px-3 py-1 text-xs text-slate-300/90">
              当前聚焦：{selectedHiddenUnitId}
            </div>
          </div>
        </div>
      )
    }

    if (currentStageId === 'activation') {
      return (
        <div className="rounded-[28px] border border-white/8 bg-white/[0.035] p-4 shadow-[inset_0_0_30px_rgba(148,163,184,0.04)]">
          <div
            className={clsx(
              'rounded-[22px] border border-white/8 bg-black/20 p-2',
              getFocusClass('activation-toggle', 'strong'),
            )}
          >
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onChangeActivationMode('off')}
                className={clsx(
                  'rounded-[18px] px-4 py-4 text-left transition',
                  effectiveActivationMode === 'off'
                    ? 'bg-amber-300/14 text-amber-50 shadow-[0_0_22px_rgba(251,191,36,0.14)]'
                    : 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]',
                )}
              >
                <div className="font-medium">关闭激活</div>
                <div className="mt-2 text-xs leading-6 text-slate-400">
                  多层线性仍等价于一个整体线性规则
                </div>
              </button>
              <button
                type="button"
                onClick={() => onChangeActivationMode('relu')}
                className={clsx(
                  'rounded-[18px] px-4 py-4 text-left transition',
                  effectiveActivationMode === 'relu'
                    ? 'bg-cyan-300/[0.12] text-slate-100 shadow-[0_0_24px_rgba(34,211,238,0.16)]'
                    : 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]',
                )}
              >
                <div className="font-medium">开启激活</div>
                <div className="mt-2 text-xs leading-6 text-slate-400">
                  隐藏单元可以在不同区域做出不同响应
                </div>
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm leading-7 text-slate-400">
              切换激活开关，观察右侧边界是收缩成整体线性，还是分化成区域敏感的中间响应。
            </div>
            <label className="flex items-center gap-3 rounded-full border border-white/8 bg-black/20 px-3 py-2 text-sm text-slate-200/90">
              <span>显示简化理解视图</span>
              <button
                type="button"
                aria-pressed={intuitionView}
                onClick={() => onToggleIntuitionView(!intuitionView)}
                className={clsx(
                  'relative h-6 w-12 rounded-full border transition',
                  intuitionView ? 'border-sky-300/40 bg-sky-300/18' : 'border-slate-700 bg-slate-900',
                )}
              >
                <span
                  className={clsx(
                    'absolute top-[3px] h-[18px] w-[18px] rounded-full bg-slate-50 transition',
                    intuitionView ? 'left-7' : 'left-1',
                  )}
                />
              </button>
            </label>
          </div>
        </div>
      )
    }

    if (currentStageId === 'build') {
      return (
        <div className="rounded-[28px] border border-white/8 bg-white/[0.035] p-4 shadow-[inset_0_0_30px_rgba(148,163,184,0.04)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs tracking-[0.18em] text-slate-400">构造式实验台</p>
              <p className="mt-2 text-sm leading-7 text-slate-300/90">
                先摆放 4 个边界检测器，再用阈值把它们组合成一个更完整的安全判断。
              </p>
            </div>
            <div className="rounded-full border border-amber-300/18 bg-amber-300/10 px-3 py-1 text-xs text-amber-50/90">
              Remaining mismatches：{buildMismatchCount}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onPlayBuildFlow}
              className="rounded-2xl border border-white/8 bg-white/[0.05] px-4 py-3 text-sm text-slate-100 transition hover:border-slate-500 hover:bg-white/[0.08]"
            >
              播放信号流
            </button>
            <button
              type="button"
              onClick={handleShowExample}
              disabled={showExampleBusy}
              className={clsx(
                'rounded-2xl border border-white/8 bg-white/[0.05] px-4 py-3 text-sm text-slate-100 transition hover:border-slate-500 hover:bg-white/[0.08] disabled:opacity-50',
                getFocusClass('build-example'),
              )}
            >
              {showExampleBusy ? '教师示范中…' : 'Show me one example'}
            </button>
            <button
              type="button"
              onClick={onAutofillBuildDemo}
              className="rounded-2xl border border-white/8 bg-white/[0.05] px-4 py-3 text-sm text-slate-100 transition hover:border-slate-500 hover:bg-white/[0.08]"
            >
              Auto-fill demo
            </button>
            <button
              type="button"
              onClick={onResetBuildNetwork}
              className="rounded-2xl border border-white/8 bg-white/[0.05] px-4 py-3 text-sm text-slate-100 transition hover:border-slate-500 hover:bg-white/[0.08]"
            >
              重置构造
            </button>
          </div>
        </div>
      )
    }

    if (currentStageId === 'trace') {
      return (
        <div className="grid gap-4 lg:grid-cols-2">
          <div
            className={clsx(
              'rounded-[28px] border border-white/8 bg-white/[0.035] p-4 shadow-[inset_0_0_30px_rgba(148,163,184,0.04)]',
              getFocusClass('trace-question-1'),
            )}
          >
            <p className="text-xs tracking-[0.18em] text-slate-400">任务 1</p>
            <h3 className="mt-2 font-display text-lg text-slate-100">
              增加一个隐藏单元后，哪些后续部分会受影响？
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              这里不需要精确数学，先预测哪些后续部分可能受影响。
            </p>
            <div className="mt-4 space-y-3">
              {traceQuestionOneOptions.map((option) => {
                const selected = traceAnswerOne === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onSelectTraceAnswerOne(option.id)}
                    className={clsx(
                      'w-full rounded-[20px] border px-4 py-3 text-left transition',
                      selected
                        ? 'border-cyan-300/45 bg-cyan-300/[0.12] text-slate-100'
                        : 'border-white/8 bg-black/20 text-slate-300/92 hover:border-slate-500 hover:bg-white/[0.05]',
                    )}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="mt-1 text-xs leading-6 text-slate-400">{option.note}</div>
                  </button>
                )
              })}
            </div>
            <button
              type="button"
              onClick={onRunTraceTestOne}
              disabled={!traceAnswerOne}
              className="primary-action mt-4 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-45"
            >
              测试这个变化
            </button>
          </div>

          <div
            className={clsx(
              'rounded-[28px] border border-white/8 bg-white/[0.035] p-4 shadow-[inset_0_0_30px_rgba(148,163,184,0.04)]',
              getFocusClass('trace-question-2'),
            )}
          >
            <p className="text-xs tracking-[0.18em] text-slate-400">任务 2</p>
            <h3 className="mt-2 font-display text-lg text-slate-100">
              修改一条输入到隐藏单元的权重后，哪些部分可能变化？
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              先做预测，再拖动权重，最后观察变化是怎样向后传播的。
            </p>
            <div className="mt-4 space-y-3">
              {traceQuestionTwoOptions.map((option) => {
                const selected = traceAnswerTwo === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onSelectTraceAnswerTwo(option.id)}
                    className={clsx(
                      'w-full rounded-[20px] border px-4 py-3 text-left transition',
                      selected
                        ? 'border-cyan-300/45 bg-cyan-300/[0.12] text-slate-100'
                        : 'border-white/8 bg-black/20 text-slate-300/92 hover:border-slate-500 hover:bg-white/[0.05]',
                    )}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="mt-1 text-xs leading-6 text-slate-400">{option.note}</div>
                  </button>
                )
              })}
            </div>
            <label className="mt-4 block text-sm text-slate-300/90">
              <span className="mb-2 block">拖动这条权重</span>
              <input
                type="range"
                min={-1.8}
                max={1.8}
                step={0.05}
                value={traceWeight}
                onChange={(event) => onSetTraceWeight(Number(event.target.value))}
                className="w-full accent-sky-300"
                aria-label="拖动连接权重"
              />
              <span className="mt-2 block font-mono tabular-nums text-xs text-slate-400">
                当前权重 {formatNumber(traceWeight)}
              </span>
            </label>
            <button
              type="button"
              onClick={onApplyTraceWeight}
              disabled={!traceAnswerTwo}
              className="primary-action mt-4 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-45"
            >
              应用变化
            </button>
          </div>
        </div>
      )
    }

    if (currentStageId === 'summary') {
      return (
        <div
          className={clsx(
            'rounded-[28px] border border-white/8 bg-white/[0.035] p-4 shadow-[inset_0_0_30px_rgba(148,163,184,0.04)]',
            getFocusClass('summary-replay'),
          )}
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs tracking-[0.18em] text-slate-400">重播故事</p>
              <p className="mt-2 text-sm leading-7 text-slate-300/90">
                选择一个你想再看一遍的概念，把整节课的故事重新串起来。
              </p>
            </div>
            <div className="text-xs text-slate-400">
              这是根据你在本课中的探索形成的粗略回顾，不是正式评分。
            </div>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-4">
            {summaryReplayItems.map((item) => {
              const selected = missionReplaySelection === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSetMissionReplaySelection(item.id)}
                  className={clsx(
                    'rounded-[20px] border px-4 py-4 text-left transition',
                    selected
                      ? 'border-cyan-300/45 bg-cyan-300/[0.12] text-slate-100 shadow-[0_0_22px_rgba(34,211,238,0.15)]'
                      : 'border-white/8 bg-black/20 text-slate-300/92 hover:border-slate-500 hover:bg-white/[0.05]',
                  )}
                >
                  <div className="text-sm font-medium leading-6">{item.label}</div>
                </button>
              )
            })}
          </div>
        </div>
      )
    }

    return (
      <div className="rounded-[28px] border border-white/8 bg-white/[0.035] p-4 text-sm leading-7 text-slate-300/90 shadow-[inset_0_0_30px_rgba(148,163,184,0.04)]">
        当前页面没有额外控制区，请直接跟随任务条与右侧帮助提示进行操作。
      </div>
    )
  }

  function renderBuildWorkbench() {
    const angleDegrees = (selectedBuildUnit.angle * 180) / Math.PI
    const guidedLock =
      guidedMode === 'guided' &&
      focusedBuildUnitId &&
      focusedBuildUnitId !== selectedBuildUnit.id

    return (
      <div className="rounded-[30px] border border-white/8 bg-white/[0.035] p-5 shadow-[inset_0_0_30px_rgba(148,163,184,0.04)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs tracking-[0.18em] text-slate-400">当前构造工作台</p>
            <h3 className="mt-2 font-display text-xl text-slate-100">
              {selectedBuildUnit.label} 边界检测器
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-300/90">
              拖动地图上的手柄或使用下面的精细控制，让当前检测器更贴近安全区的一条边界。
            </p>
          </div>
          <div className="rounded-full border border-white/8 bg-black/20 px-3 py-1 font-mono tabular-nums text-xs text-slate-300/90">
            当前阈值 {formatNumber(buildThreshold)} · 当前匹配率 {Math.round(buildScore * 100)}%
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-4 md:grid-cols-3">
            <label
              className={clsx(
                'rounded-[22px] border border-white/8 bg-black/20 p-4 text-sm text-slate-300/90',
                focusedBuildUnitId === selectedBuildUnit.id
                  ? getFocusClass(`build-unit-${selectedBuildUnit.id.toLowerCase()}`)
                  : '',
                guidedLock && 'opacity-55',
              )}
            >
              <span className="mb-2 block">拖动角度</span>
              <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={angleDegrees}
                disabled={guidedLock}
                onChange={(event) =>
                  onChangeBuildUnit(selectedBuildUnit.id, {
                    angle: (Number(event.target.value) * Math.PI) / 180,
                  })
                }
                className="w-full accent-sky-300"
                aria-label="拖动角度"
              />
              <span className="mt-2 block font-mono tabular-nums text-xs text-slate-400">
                {formatNumber(angleDegrees)}°
              </span>
            </label>

            <label
              className={clsx(
                'rounded-[22px] border border-white/8 bg-black/20 p-4 text-sm text-slate-300/90',
                guidedLock && 'opacity-55',
              )}
            >
              <span className="mb-2 block">拖动位置</span>
              <input
                type="range"
                min={-3.8}
                max={3.8}
                step={0.05}
                value={selectedBuildUnit.offset}
                disabled={guidedLock}
                onChange={(event) =>
                  onChangeBuildUnit(selectedBuildUnit.id, {
                    offset: Number(event.target.value),
                  })
                }
                className="w-full accent-sky-300"
                aria-label="拖动位置"
              />
              <span className="mt-2 block font-mono tabular-nums text-xs text-slate-400">
                {formatNumber(selectedBuildUnit.offset)}
              </span>
            </label>

            <div
              className={clsx(
                'rounded-[22px] border border-white/8 bg-black/20 p-4 text-sm text-slate-300/90',
                guidedLock && 'opacity-55',
              )}
            >
              <span className="mb-2 block">选择响应方向</span>
              <div className="grid gap-2">
                <button
                  type="button"
                  disabled={guidedLock}
                  onClick={() => onChangeBuildUnit(selectedBuildUnit.id, { side: 1 })}
                  className={clsx(
                    'rounded-2xl border px-3 py-3 text-left transition',
                    selectedBuildUnit.side === 1
                      ? 'border-cyan-300/45 bg-cyan-300/[0.12] text-slate-100'
                      : 'border-white/8 bg-white/[0.03] text-slate-300 hover:bg-white/[0.05]',
                  )}
                >
                  让这一侧更容易激活
                </button>
                <button
                  type="button"
                  disabled={guidedLock}
                  onClick={() => onChangeBuildUnit(selectedBuildUnit.id, { side: -1 })}
                  className={clsx(
                    'rounded-2xl border px-3 py-3 text-left transition',
                    selectedBuildUnit.side === -1
                      ? 'border-cyan-300/45 bg-cyan-300/[0.12] text-slate-100'
                      : 'border-white/8 bg-white/[0.03] text-slate-300 hover:bg-white/[0.05]',
                  )}
                >
                  让对侧更容易激活
                </button>
              </div>
            </div>
          </div>

          <div
            className={clsx(
              'rounded-[24px] border border-white/8 bg-black/20 p-4',
              getFocusClass('build-threshold', 'strong'),
            )}
          >
            <p className="text-xs tracking-[0.18em] text-slate-400">最终组合</p>
            <h4 className="mt-2 font-display text-lg text-slate-100">调整输出阈值</h4>
            <p className="mt-2 text-sm leading-7 text-slate-300/90">
              当前 4 个中间检测器已经提供了局部几何信息。最后一步是调节阈值，让输出层把这些响应合并成一个稳定判断。
            </p>
            <label className="mt-4 block text-sm text-slate-300/90">
              <span className="mb-2 block">拖动阈值</span>
              <input
                type="range"
                min={1}
                max={4.6}
                step={0.05}
                value={buildThreshold}
                onChange={(event) => onChangeBuildThreshold(Number(event.target.value))}
                className="w-full accent-cyan-300"
                aria-label="拖动输出阈值"
              />
              <span className="mt-2 block font-mono tabular-nums text-xs text-slate-400">
                当前阈值 {formatNumber(buildThreshold)}
              </span>
            </label>
          </div>
        </div>
      </div>
    )
  }
}
