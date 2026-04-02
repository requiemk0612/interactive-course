import { useMemo } from 'react'
import { CourseShell } from './components/CourseShell'
import { samplePoints } from './data/dataset'
import { stageList } from './data/learningFlowConfig'
import { courseMeta } from './data/lessonMeta'
import { getConceptCards, getUnderstandingProfile } from './data/stageConfigs'
import { scoreBuildNetwork } from './lib/networkMath'
import { useLessonStore } from './store/useLessonStore'

function App() {
  const {
    currentStageId,
    teacherMode,
    setTeacherMode,
    goNext,
    goPrevious,
    setStage,
    resetLesson,
    challengeModel,
    challengePrediction,
    setChallengePrediction,
    challengeChecked,
    runChallengeCheck,
    setChallengeModel,
    probePoint,
    setProbePoint,
    selectedHiddenUnitId,
    selectHiddenUnit,
    activationMode,
    setActivationMode,
    intuitionView,
    setIntuitionView,
    buildUnits,
    setBuildUnit,
    selectedBuildUnitId,
    selectBuildUnit,
    buildThreshold,
    setBuildThreshold,
    buildPlaySeed,
    playBuildFlow,
    buildGuideStep,
    stepBuildGuide,
    resetBuildNetwork,
    autofillBuildDemo,
    inspector,
    setInspector,
    highlightEdgeId,
    setHighlightEdgeId,
    traceAnswerOne,
    setTraceAnswerOne,
    traceTestOne,
    runTraceTestOne,
    traceAnswerTwo,
    setTraceAnswerTwo,
    traceWeight,
    setTraceWeight,
    traceApplied,
    applyTraceWeight,
    engagement,
  } = useLessonStore()

  const stageIndex = stageList.findIndex((stage) => stage.id === currentStageId)
  const activeStage = stageList[stageIndex]

  const buildScore = useMemo(
    () =>
      samplePoints.reduce((sum, point) => {
        const predicted = scoreBuildNetwork(point, buildUnits, buildThreshold) >= 0
        return sum + Number(predicted === point.isSafe)
      }, 0) / samplePoints.length,
    [buildThreshold, buildUnits],
  )

  const conceptCards = useMemo(
    () =>
      getConceptCards({
        stageId: currentStageId,
        teacherMode,
        challengeChecked,
        challengePrediction,
        activationMode,
        buildScore,
        traceApplied,
      }),
    [
      activationMode,
      buildScore,
      challengeChecked,
      challengePrediction,
      currentStageId,
      teacherMode,
      traceApplied,
    ],
  )

  const understandingProfile = useMemo(
    () => getUnderstandingProfile(engagement),
    [engagement],
  )

  return (
    <CourseShell
      meta={courseMeta}
      stage={activeStage}
      stageIndex={stageIndex}
      stages={stageList}
      currentStageId={currentStageId}
      teacherMode={teacherMode}
      onToggleTeacherMode={setTeacherMode}
      onReset={resetLesson}
      onNext={goNext}
      onPrevious={goPrevious}
      onSelectStage={setStage}
      conceptCards={conceptCards}
      challengeModel={challengeModel}
      onChangeChallengeModel={setChallengeModel}
      challengePrediction={challengePrediction}
      onChoosePrediction={setChallengePrediction}
      challengeChecked={challengeChecked}
      onRunChallenge={runChallengeCheck}
      probePoint={probePoint}
      onChangeProbePoint={setProbePoint}
      selectedHiddenUnitId={selectedHiddenUnitId}
      onSelectHiddenUnit={selectHiddenUnit}
      activationMode={activationMode}
      onChangeActivationMode={setActivationMode}
      intuitionView={intuitionView}
      onToggleIntuitionView={setIntuitionView}
      buildUnits={buildUnits}
      onChangeBuildUnit={setBuildUnit}
      selectedBuildUnitId={selectedBuildUnitId}
      onSelectBuildUnit={selectBuildUnit}
      buildThreshold={buildThreshold}
      onChangeBuildThreshold={setBuildThreshold}
      buildPlaySeed={buildPlaySeed}
      onPlayBuildFlow={playBuildFlow}
      buildGuideStep={buildGuideStep}
      onStepBuildGuide={stepBuildGuide}
      onResetBuildNetwork={resetBuildNetwork}
      onAutofillBuildDemo={autofillBuildDemo}
      buildScore={buildScore}
      inspector={inspector}
      onSetInspector={setInspector}
      highlightEdgeId={highlightEdgeId}
      onHighlightEdge={setHighlightEdgeId}
      traceAnswerOne={traceAnswerOne}
      onSelectTraceAnswerOne={setTraceAnswerOne}
      traceTestOne={traceTestOne}
      onRunTraceTestOne={runTraceTestOne}
      traceAnswerTwo={traceAnswerTwo}
      onSelectTraceAnswerTwo={setTraceAnswerTwo}
      traceWeight={traceWeight}
      onSetTraceWeight={setTraceWeight}
      traceApplied={traceApplied}
      onApplyTraceWeight={applyTraceWeight}
      understandingProfile={understandingProfile}
    />
  )
}

export default App
