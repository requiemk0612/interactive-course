import { useMemo } from 'react'
import { CourseShell } from './components/CourseShell'
import { samplePoints } from './data/dataset'
import { stageList } from './data/learningFlowConfig'
import { courseMeta } from './data/lessonMeta'
import { getConceptCards, getUnderstandingProfile } from './data/stageConfigs'
import { scoreBuildNetwork } from './lib/networkMath'
import { useLessonStore } from './store/useLessonStore'

function App() {
  const store = useLessonStore()
  const stageIndex = stageList.findIndex((stage) => stage.id === store.currentStageId)
  const activeStage = stageList[stageIndex]

  const buildMatches = useMemo(
    () =>
      samplePoints.reduce((sum, point) => {
        const predicted = scoreBuildNetwork(point, store.buildUnits, store.buildThreshold) >= 0
        return sum + Number(predicted === point.isSafe)
      }, 0),
    [store.buildThreshold, store.buildUnits],
  )

  const buildScore = buildMatches / samplePoints.length
  const buildMismatchCount = samplePoints.length - buildMatches

  const conceptCards = useMemo(
    () =>
      getConceptCards({
        stageId: store.currentStageId,
        teacherMode: store.teacherMode,
        challengeChecked: store.challengeChecked,
        challengePrediction: store.challengePrediction,
        activationMode: store.activationMode,
        buildScore,
        traceApplied: store.traceApplied,
      }),
    [
      buildScore,
      store.activationMode,
      store.challengeChecked,
      store.challengePrediction,
      store.currentStageId,
      store.teacherMode,
      store.traceApplied,
    ],
  )

  const understandingProfile = useMemo(
    () => getUnderstandingProfile(store.engagement),
    [store.engagement],
  )

  return (
    <CourseShell
      meta={courseMeta}
      stage={activeStage}
      stageIndex={stageIndex}
      stages={stageList}
      currentStageId={store.currentStageId}
      teacherMode={store.teacherMode}
      guidedMode={store.guidedMode}
      showOnboarding={store.showOnboarding}
      helpOpen={store.helpOpen}
      completedActions={store.completedActions}
      seenStageIntro={store.seenStageIntro}
      toastMessage={store.toastMessage}
      missionReplaySelection={store.missionReplaySelection}
      onStartGuidedMode={store.startGuidedMode}
      onStartFreeMode={store.startFreeMode}
      onRestartWithGuide={store.restartWithGuide}
      onSetHelpOpen={store.setHelpOpen}
      onClearToast={store.clearToast}
      onMarkStageIntroSeen={store.markStageIntroSeen}
      onToggleTeacherMode={store.setTeacherMode}
      onReset={store.resetLesson}
      onNext={store.goNext}
      onPrevious={store.goPrevious}
      onSelectStage={store.setStage}
      conceptCards={conceptCards}
      challengeModel={store.challengeModel}
      onChangeChallengeModel={store.setChallengeModel}
      challengePrediction={store.challengePrediction}
      onChoosePrediction={store.setChallengePrediction}
      challengeChecked={store.challengeChecked}
      onRunChallenge={store.runChallengeCheck}
      probePoint={store.probePoint}
      onChangeProbePoint={store.setProbePoint}
      selectedHiddenUnitId={store.selectedHiddenUnitId}
      onSelectHiddenUnit={store.selectHiddenUnit}
      activationMode={store.activationMode}
      onChangeActivationMode={store.setActivationMode}
      intuitionView={store.intuitionView}
      onToggleIntuitionView={store.setIntuitionView}
      buildUnits={store.buildUnits}
      onChangeBuildUnit={store.setBuildUnit}
      selectedBuildUnitId={store.selectedBuildUnitId}
      onSelectBuildUnit={store.selectBuildUnit}
      buildThreshold={store.buildThreshold}
      onChangeBuildThreshold={store.setBuildThreshold}
      buildPlaySeed={store.buildPlaySeed}
      onPlayBuildFlow={store.playBuildFlow}
      onResetBuildNetwork={store.resetBuildNetwork}
      onAutofillBuildDemo={store.autofillBuildDemo}
      buildScore={buildScore}
      buildMismatchCount={buildMismatchCount}
      inspector={store.inspector}
      onSetInspector={store.setInspector}
      highlightEdgeId={store.highlightEdgeId}
      onHighlightEdge={store.setHighlightEdgeId}
      traceAnswerOne={store.traceAnswerOne}
      onSelectTraceAnswerOne={store.setTraceAnswerOne}
      traceTestOne={store.traceTestOne}
      onRunTraceTestOne={store.runTraceTestOne}
      traceAnswerTwo={store.traceAnswerTwo}
      onSelectTraceAnswerTwo={store.setTraceAnswerTwo}
      traceWeight={store.traceWeight}
      onSetTraceWeight={store.setTraceWeight}
      traceApplied={store.traceApplied}
      onApplyTraceWeight={store.applyTraceWeight}
      understandingProfile={understandingProfile}
      onSetMissionReplaySelection={store.setMissionReplaySelection}
    />
  )
}

export default App
