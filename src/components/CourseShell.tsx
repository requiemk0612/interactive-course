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

export function CourseShell(props: Props) {
  const {
    meta, stage, stageIndex, stages, currentStageId, teacherMode, guidedMode, showOnboarding,
    helpOpen, completedActions, seenStageIntro, toastMessage, missionReplaySelection,
    onStartGuidedMode, onStartFreeMode, onRestartWithGuide, onSetHelpOpen, onClearToast,
    onMarkStageIntroSeen, onToggleTeacherMode, onReset, onNext, onPrevious, onSelectStage,
    conceptCards, challengeModel, onChangeChallengeModel, challengePrediction, onChoosePrediction,
    challengeChecked, onRunChallenge, probePoint, onChangeProbePoint, selectedHiddenUnitId,
    onSelectHiddenUnit, activationMode, onChangeActivationMode, intuitionView,
    onToggleIntuitionView, buildUnits, onChangeBuildUnit, selectedBuildUnitId,
    onSelectBuildUnit, buildThreshold, onChangeBuildThreshold, buildPlaySeed, onPlayBuildFlow,
    onResetBuildNetwork, onAutofillBuildDemo, buildScore, buildMismatchCount, inspector,
    onSetInspector, highlightEdgeId, onHighlightEdge, traceAnswerOne, onSelectTraceAnswerOne,
    traceTestOne, onRunTraceTestOne, traceAnswerTwo, onSelectTraceAnswerTwo, traceWeight,
    onSetTraceWeight, traceApplied, onApplyTraceWeight, understandingProfile,
    onSetMissionReplaySelection,
  } = props

  const [activationPreviewMode, setActivationPreviewMode] = useState<ActivationMode | null>(null)
  const [showExampleBusy, setShowExampleBusy] = useState(false)
  const activeGuideStep = getActiveGuideStep(currentStageId, completedActions)
  const guideSteps = getGuideSteps(currentStageId)
  const stageProgress = getStageProgress(currentStageId, completedActions)
  const taskStrip = getTaskStrip({ stageId: currentStageId, guideMode: guidedMode, completedActions })
  const stageComplete = isStageComplete(currentStageId, completedActions)
  const challengeClosedLoop = completedActions.includes('challenge-prediction') && completedActions.includes('challenge-run-check')
  const canGoNext = stageIndex < stages.length - 1 && (guidedMode === 'guided' ? stageComplete : currentStageId === 'challenge' ? challengeClosedLoop : true)
  const unlockedStageIds = useMemo(
    () => (guidedMode === 'guided'
      ? stages.filter((_, index) => index <= stageIndex + (stageComplete ? 1 : 0)).map((item) => item.id)
      : stages.map((item) => item.id)),
    [guidedMode, stageComplete, stageIndex, stages],
  )
  const selectedBuildUnit = buildUnits.find((unit) => unit.id === selectedBuildUnitId) ?? buildUnits[0]
  const effectiveActivationMode = activationPreviewMode ?? activationMode
  const showStageIntroDemo = guidedMode === 'guided' && !seenStageIntro.includes(currentStageId) && (currentStageId === 'challenge' || currentStageId === 'io')

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
    const target = { 'build-unit-h1': 'H1', 'build-unit-h2': 'H2', 'build-unit-h3': 'H3', 'build-unit-h4': 'H4' }[String(activeGuideStep?.focusTarget)] as HiddenUnitId | undefined
    if (target && target !== selectedBuildUnitId) {
      onSelectBuildUnit(target)
    }
  }, [activeGuideStep?.focusTarget, currentStageId, guidedMode, onSelectBuildUnit, selectedBuildUnitId])

  async function handleShowExample() {
    if (showExampleBusy) return
    setShowExampleBusy(true)
    ;(['H1', 'H2', 'H3', 'H4'] as HiddenUnitId[]).forEach((id, index) => {
      window.setTimeout(() => {
        const unit = demoHiddenUnits[index]
        onSelectBuildUnit(id)
        onChangeBuildUnit(id, { angle: unit.angle, offset: unit.offset, side: unit.side })
      }, index * 650)
    })
    window.setTimeout(() => onChangeBuildThreshold(3.15), 4 * 650)
    window.setTimeout(() => onPlayBuildFlow(), 5 * 650)
    window.setTimeout(() => setShowExampleBusy(false), 6 * 650)
  }

  return (
    <div className="min-h-screen text-slate-100">
      <OnboardingBriefing open={showOnboarding} panels={onboardingPanels} onStartGuided={onStartGuidedMode} onStartFree={onStartFreeMode} />
      <HelpLayer open={helpOpen} topic={helpTopics[currentStageId]} onClose={() => onSetHelpOpen(false)} />
      <FeedbackToast message={toastMessage} onClose={onClearToast} />

      <header className="sticky top-0 z-40 border-b border-white/8 bg-ink-950/86 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-5 px-4 py-4 lg:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-xs tracking-[0.28em] text-cyan-100/70">完整互动式教学作品</p>
              <h1 className="mt-2 font-display text-3xl leading-tight tracking-[0.04em] text-slate-100 lg:text-[2.3rem]">{meta.courseTitle}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-300/90">
                <span className="rounded-full border border-white/8 bg-white/[0.05] px-3 py-1">{meta.lessonTag} · {meta.lessonTitle}</span>
                <span className="max-w-3xl leading-7 text-slate-400">{meta.lessonNarrative}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <MissionProgress stageIndex={stageIndex} stageTotal={stages.length} stepCompleted={guideSteps.length ? stageProgress.currentStepIndex : undefined} stepTotal={guideSteps.length ? stageProgress.total : undefined} />
              <button type="button" className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-slate-200/90 transition hover:border-slate-500 hover:bg-white/[0.08]" onClick={() => onSetHelpOpen(true)}>我现在看到的是什么？</button>
              <button type="button" className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-slate-200/90 transition hover:border-slate-500 hover:bg-white/[0.08]" onClick={onRestartWithGuide}>重新开始并进入引导</button>
              <button type="button" className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-slate-200/90 transition hover:border-slate-500 hover:bg-white/[0.08]" onClick={onReset}>重置本单元</button>
              <label className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-slate-200/90">
                <span>教师模式</span>
                <button type="button" aria-pressed={teacherMode} onClick={() => onToggleTeacherMode(!teacherMode)} className={clsx('relative h-7 w-14 rounded-full border transition', teacherMode ? 'border-cyan-300/40 bg-cyan-300/18' : 'border-slate-700 bg-slate-900')}>
                  <span className={clsx('absolute top-1 h-5 w-5 rounded-full bg-slate-50 transition', teacherMode ? 'left-8' : 'left-1')} />
                </button>
              </label>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1800px] grid-cols-1 gap-6 px-4 py-6 lg:px-6 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden xl:block">
          <ChapterRail stages={stages} currentStageId={currentStageId} guideMode={guidedMode} unlockedStageIds={unlockedStageIds} onSelectStage={onSelectStage} />
        </aside>

        <section className="space-y-6">
          <div className="glass-panel rounded-[32px] border border-white/8">
            <div className="border-b border-white/8 px-5 py-5 lg:px-7">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-4xl">
                  <p className="text-xs tracking-[0.26em] text-cyan-100/70">{stage.titleZh} · {stage.titleEn}</p>
                  <h2 className="mt-2 font-display text-2xl tracking-[0.04em] text-slate-100 lg:text-3xl">{stage.headline}</h2>
                  {currentStageId === 'hidden' ? <p className="mt-3 text-sm leading-7 text-slate-300/90">操作提示：一次只看一个隐藏单元。</p> : null}
                  {currentStageId === 'trace' ? <p className="mt-3 text-sm leading-7 text-slate-300/90">网络已经能工作了，现在来检查一个局部变化会怎样影响后续计算。</p> : null}
                  {currentStageId === 'activation' && guidedMode === 'guided' && !seenStageIntro.includes('activation') ? <p className="mt-3 text-sm leading-7 text-amber-100/90">到这里为止，只是增加单元数量仍然不够。</p> : null}
                  <p className="mt-3 max-w-4xl text-base leading-8 text-slate-300/90">{stage.description}</p>
                </div>
                <div className="rounded-[22px] border border-white/8 bg-white/[0.04] px-4 py-3 text-sm leading-7 text-slate-300/90">按顺序体验 7 个教学环节，也可以从左侧直接切换。</div>
              </div>

              <div className="mt-5"><CurrentTaskStrip task={taskStrip} guideMode={guidedMode} stepLabel={guidedMode === 'guided' && guideSteps.length ? `步骤 ${Math.min(stageProgress.currentStepIndex + 1, stageProgress.total)} / ${stageProgress.total}` : null} /></div>
              <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div>{renderToolbar()}</div>
                <GuideManager guideMode={guidedMode} step={activeGuideStep} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 p-5 lg:p-7 2xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="relative">
                  <NetworkVisualization stageId={currentStageId} model={challengeModel} onChangeChallengeModel={onChangeChallengeModel} probePoint={probePoint} selectedHiddenUnitId={selectedHiddenUnitId} onSelectHiddenUnit={onSelectHiddenUnit} buildUnits={buildUnits} selectedBuildUnitId={selectedBuildUnitId} onSelectBuildUnit={onSelectBuildUnit} buildThreshold={buildThreshold} buildPlaySeed={buildPlaySeed} teacherMode={teacherMode} guidedMode={guidedMode} focusTarget={activeGuideStep?.focusTarget ?? null} highlightEdgeId={highlightEdgeId} onHighlightEdge={onHighlightEdge} onSetInspector={onSetInspector} />
                  <InspectorPopover inspector={inspector} onClose={() => onSetInspector(null)} />
                </div>
                <LandingMapCanvas stageId={currentStageId} model={challengeModel} onChangeModel={onChangeChallengeModel} challengeChecked={challengeChecked} probePoint={probePoint} onChangeProbePoint={onChangeProbePoint} selectedHiddenUnitId={selectedHiddenUnitId} activationMode={effectiveActivationMode} intuitionView={intuitionView} buildUnits={buildUnits} selectedBuildUnitId={selectedBuildUnitId} onChangeBuildUnit={onChangeBuildUnit} onSelectBuildUnit={onSelectBuildUnit} buildThreshold={buildThreshold} buildScore={buildScore} traceTestOne={traceTestOne} traceWeight={traceWeight} traceApplied={traceApplied} teacherMode={teacherMode} guidedMode={guidedMode} focusTarget={activeGuideStep?.focusTarget ?? null} showStageIntroDemo={showStageIntroDemo} missionReplaySelection={missionReplaySelection} onSetInspector={onSetInspector} />
              </div>
              <ConceptPanel stage={stage} cards={conceptCards} understandingProfile={understandingProfile} />
            </div>

            {currentStageId === 'build' ? (
              <div className="border-t border-white/8 px-5 py-5 lg:px-7">
                <div className="rounded-[26px] border border-white/8 bg-white/[0.035] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs tracking-[0.22em] text-slate-400">当前选中的边界检测器</div>
                      <div className="mt-1 font-display text-lg text-slate-100">{selectedBuildUnit.label} 控制面板</div>
                    </div>
                    <div className="rounded-full border border-white/8 bg-black/20 px-3 py-1 text-sm font-mono text-slate-300">Remaining mismatches：{buildMismatchCount}</div>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    {renderBuildSlider('拖动以旋转角度', selectedBuildUnit.angle, -3.14, 3.14, 0.01, (value) => onChangeBuildUnit(selectedBuildUnit.id, { angle: value }))}
                    {renderBuildSlider('拖动以平移边界', selectedBuildUnit.offset, -3.5, 3.5, 0.02, (value) => onChangeBuildUnit(selectedBuildUnit.id, { offset: value }))}
                    <div className="rounded-[22px] border border-white/8 bg-black/20 p-4 text-sm text-slate-200/90">
                      <span className="mb-3 block">选择响应更强的一侧</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" className={chipClass(selectedBuildUnit.side === 1)} onClick={() => onChangeBuildUnit(selectedBuildUnit.id, { side: 1 })}>选择这一侧</button>
                        <button type="button" className={chipClass(selectedBuildUnit.side === -1)} onClick={() => onChangeBuildUnit(selectedBuildUnit.id, { side: -1 })}>选择另一侧</button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-[22px] border border-white/8 bg-black/20 p-4">
                    <div className="text-xs tracking-[0.22em] text-slate-400">调整输出阈值</div>
                    <input type="range" min={1.2} max={4.2} step={0.05} value={buildThreshold} onChange={(event) => onChangeBuildThreshold(Number(event.target.value))} className="mt-4 w-full accent-emerald-300" />
                    <div className="mt-3 font-mono text-sm text-slate-200/90">{formatNumber(buildThreshold)}</div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="border-t border-white/8 px-5 py-4 lg:px-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="text-sm leading-7 text-slate-400">本作品围绕一个完整知识点，设计了 7 个连续教学环节，让学习者从“直接规则失败”一路走到“隐藏层与激活函数为何必要”的清晰理解。</div>
                <div className="flex gap-3">
                  <button type="button" onClick={onPrevious} disabled={stageIndex === 0} className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-45">上一步</button>
                  <button type="button" onClick={onNext} disabled={!canGoNext} className="primary-action rounded-2xl px-4 py-3 text-sm text-slate-950 disabled:cursor-not-allowed disabled:opacity-45">下一步</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )

  function renderBuildSlider(label: string, value: number, min: number, max: number, step: number, onChange: (value: number) => void) {
    return (
      <label className="rounded-[22px] border border-white/8 bg-black/20 p-4 text-sm text-slate-200/90">
        <span className="mb-2 block">{label}</span>
        <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-sky-300" />
        <span className="mt-2 block font-mono text-xs text-slate-400">{formatNumber(value)}</span>
      </label>
    )
  }

  function chipClass(active: boolean) {
    return clsx('rounded-xl border px-3 py-3 text-xs transition', active ? 'border-sky-300/40 bg-sky-300/15 text-sky-50' : 'border-white/8 bg-slate-900/60 text-slate-300 hover:bg-white/[0.05]')
  }

  function renderToolbar() {
    if (currentStageId === 'challenge') {
      return <div className="rounded-[26px] border border-white/8 bg-white/[0.035] p-4"><div className="text-sm leading-7 text-slate-300/90">先做预测，再运行检验。</div><div className="mt-4 flex flex-wrap justify-center gap-3">{[['yes', '是的，一条线就够了'], ['no', '不是，一条线不够'], ['unsure', '我还不确定']].map(([key, label]) => <button key={key} type="button" onClick={() => onChoosePrediction(key as 'yes' | 'no' | 'unsure')} className={clsx('rounded-full border px-4 py-2 text-sm transition', challengePrediction === key ? 'border-sky-300/50 bg-sky-300/15 text-sky-50' : 'border-white/8 bg-black/20 text-slate-300 hover:bg-white/[0.05]')}>{label}</button>)}</div><div className="mt-5 flex flex-col items-center gap-3"><button type="button" disabled={!challengePrediction} onClick={onRunChallenge} className="primary-action rounded-full px-6 py-3 text-sm text-slate-950 disabled:cursor-not-allowed disabled:opacity-45">运行检验</button>{!challengeClosedLoop ? <div className="text-xs leading-6 text-slate-400">完成一次“先预测，再检验”的闭环后，才能进入下一页。</div> : null}</div></div>
    }
    if (currentStageId === 'activation') {
      return <div className="rounded-[26px] border border-white/8 bg-white/[0.035] p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="inline-flex rounded-full border border-white/8 bg-black/20 p-1">{[['off', '关闭激活'], ['relu', '开启激活']].map(([key, label]) => <button key={key} type="button" onClick={() => onChangeActivationMode(key as ActivationMode)} className={clsx('rounded-full px-4 py-2 text-sm transition', effectiveActivationMode === key ? 'bg-sky-300/18 text-sky-50' : 'text-slate-300 hover:bg-white/[0.06]')}>{label}</button>)}</div><label className="inline-flex items-center gap-3 rounded-full border border-white/8 bg-black/20 px-4 py-2 text-sm text-slate-300"><span>显示简化理解视图</span><button type="button" aria-pressed={intuitionView} className={clsx('relative h-6 w-12 rounded-full border', intuitionView ? 'border-cyan-300/40 bg-cyan-300/18' : 'border-slate-700')} onClick={() => onToggleIntuitionView(!intuitionView)}><span className={clsx('absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white transition', intuitionView ? 'left-7' : 'left-1')} /></button></label></div></div>
    }
    if (currentStageId === 'build') {
      return <div className="rounded-[26px] border border-white/8 bg-white/[0.035] p-4"><div className="rounded-[20px] border border-white/8 bg-black/20 px-4 py-3 text-sm leading-7 text-slate-200/90">当前目标：先构造四个边界检测器，再用输出阈值把它们组合成一个最终降落判断。</div><div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" onClick={onPlayBuildFlow} className="rounded-full border border-sky-300/30 bg-sky-300/12 px-4 py-2 text-sm text-sky-50 transition hover:bg-sky-300/18">播放信号流</button><button type="button" onClick={handleShowExample} disabled={showExampleBusy} className="rounded-full border border-white/8 bg-black/20 px-4 py-2 text-sm text-slate-200/90 transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-45">Show me one example</button><button type="button" onClick={onAutofillBuildDemo} className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-50/90 transition hover:bg-emerald-300/16">Auto-fill demo</button><button type="button" onClick={onResetBuildNetwork} className="rounded-full border border-white/8 bg-black/20 px-4 py-2 text-sm text-slate-200/90 transition hover:bg-white/[0.05]">重置构造</button></div></div>
    }
    if (currentStageId === 'trace') {
      return <div className="grid gap-4 xl:grid-cols-2"><div className="rounded-[26px] border border-white/8 bg-white/[0.035] p-4"><p className="text-sm leading-7 text-slate-300/90">子任务 1：如果新增一个隐藏单元，哪些后续部分会受到影响？</p><p className="mt-2 text-xs leading-6 text-slate-400">这里不需要精确数学，先预测哪些后续部分可能受影响。</p><div className="mt-3 flex flex-wrap gap-2">{['只有输出节点会变化', '新增隐藏单元及其后续部分可能变化', '包括输入层在内的所有节点都会变化'].map((option) => <button key={option} type="button" onClick={() => onSelectTraceAnswerOne(option)} className={clsx('rounded-full border px-4 py-2 text-sm transition', traceAnswerOne === option ? 'border-sky-300/40 bg-sky-300/15 text-sky-50' : 'border-white/8 bg-black/20 text-slate-300 hover:bg-white/[0.05]')}>{option}</button>)}</div><button type="button" disabled={!traceAnswerOne} onClick={onRunTraceTestOne} className="primary-action mt-4 rounded-full px-5 py-2.5 text-sm text-slate-950 disabled:cursor-not-allowed disabled:opacity-45">测试这个变化</button></div><div className="rounded-[26px] border border-white/8 bg-white/[0.035] p-4"><p className="text-sm leading-7 text-slate-300/90">子任务 2：如果修改一条输入到隐藏单元的权重，哪些节点或后续计算可能变化？</p><div className="mt-3 flex flex-wrap gap-2">{['只有被选中的隐藏单元会变化', '被选中的隐藏单元以及后续部分可能变化', '整个网络所有部分都会变化'].map((option) => <button key={option} type="button" onClick={() => onSelectTraceAnswerTwo(option)} className={clsx('rounded-full border px-4 py-2 text-sm transition', traceAnswerTwo === option ? 'border-sky-300/40 bg-sky-300/15 text-sky-50' : 'border-white/8 bg-black/20 text-slate-300 hover:bg-white/[0.05]')}>{option}</button>)}</div><div className="mt-4 flex items-center gap-3"><input type="range" min={-1.4} max={1.6} step={0.05} value={traceWeight} onChange={(event) => onSetTraceWeight(Number(event.target.value))} className="flex-1 accent-amber-300" /><span className="min-w-16 font-mono text-sm text-slate-100">{formatNumber(traceWeight)}</span></div><button type="button" disabled={!traceAnswerTwo} onClick={onApplyTraceWeight} className="primary-action mt-4 rounded-full px-5 py-2.5 text-sm text-slate-950 disabled:cursor-not-allowed disabled:opacity-45">应用变化</button>{traceApplied ? <p className="mt-3 text-xs leading-6 text-slate-400">预激活值变了，但如果 ReLU 仍处在负区间，显示出来的激活值仍可能保持为 0。</p> : null}</div></div>
    }
    if (currentStageId === 'summary') {
      return <div className="rounded-[26px] border border-white/8 bg-white/[0.035] p-4"><div className="text-sm leading-7 text-slate-300/90">重播故事</div><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{summaryReplayItems.map((item) => <button key={item.id} type="button" onClick={() => onSetMissionReplaySelection(item.id)} className={clsx('rounded-[20px] border px-4 py-4 text-left transition', missionReplaySelection === item.id ? 'border-cyan-300/30 bg-cyan-300/10 text-cyan-50' : 'border-white/8 bg-black/20 text-slate-200/90 hover:bg-white/[0.05]')}>{item.label}</button>)}</div></div>
    }
    return null
  }
}
