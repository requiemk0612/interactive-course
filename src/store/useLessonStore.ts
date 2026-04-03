import { create } from 'zustand'
import { defaultProbePoint, demoHiddenUnits, initialBuildUnits } from '../data/dataset'
import { stageList } from '../data/learningFlowConfig'
import type {
  ActivationMode,
  ChallengeModel,
  EngagementState,
  GuideActionId,
  GuideMode,
  HiddenUnitConfig,
  HiddenUnitId,
  InspectorState,
  LessonStageId,
  Point2D,
} from '../types'

const initialChallengeModel: ChallengeModel = {
  wx: 0.9,
  wy: -0.6,
  bias: 0.25,
}

const initialEngagement: EngagementState = {
  movedProbe: false,
  openedHiddenUnits: [],
  comparedActivationModes: false,
  usedBuildStep: false,
  completedTrace: false,
  challengeInsight: null,
}

function createLessonState() {
  return {
    currentStageId: 'challenge' as LessonStageId,
    teacherMode: false,
    challengeModel: initialChallengeModel,
    challengePrediction: null as 'yes' | 'no' | 'unsure' | null,
    challengeChecked: false,
    probePoint: defaultProbePoint,
    selectedHiddenUnitId: 'H1' as HiddenUnitId,
    activationMode: 'relu' as ActivationMode,
    intuitionView: false,
    buildUnits: initialBuildUnits,
    selectedBuildUnitId: 'H1' as HiddenUnitId,
    buildThreshold: 3.05,
    buildPlaySeed: 0,
    inspector: null as InspectorState | null,
    highlightEdgeId: null as string | null,
    traceAnswerOne: null as string | null,
    traceTestOne: false,
    traceAnswerTwo: null as string | null,
    traceWeight: 0.85,
    traceApplied: false,
    engagement: initialEngagement,
    completedActions: [] as GuideActionId[],
    seenStageIntro: [] as LessonStageId[],
    missionReplaySelection: 'one-line-fails',
  }
}

function appendUnique<T>(items: T[], item: T) {
  return items.includes(item) ? items : [...items, item]
}

type LessonState = ReturnType<typeof createLessonState>

type LessonStore = LessonState & {
  guidedMode: GuideMode
  showOnboarding: boolean
  hasSeenOnboarding: boolean
  helpOpen: boolean
  toastMessage: string | null
  setStage: (stageId: LessonStageId) => void
  goNext: () => void
  goPrevious: () => void
  resetLesson: () => void
  restartWithGuide: () => void
  startGuidedMode: () => void
  startFreeMode: () => void
  setHelpOpen: (value: boolean) => void
  clearToast: () => void
  markStageIntroSeen: (stageId: LessonStageId) => void
  setTeacherMode: (value: boolean) => void
  setChallengeModel: (patch: Partial<ChallengeModel>) => void
  setChallengePrediction: (value: 'yes' | 'no' | 'unsure') => void
  runChallengeCheck: () => void
  setProbePoint: (point: Point2D) => void
  selectHiddenUnit: (id: HiddenUnitId) => void
  setActivationMode: (mode: ActivationMode) => void
  setIntuitionView: (value: boolean) => void
  setBuildUnit: (id: HiddenUnitId, patch: Partial<HiddenUnitConfig>) => void
  selectBuildUnit: (id: HiddenUnitId) => void
  setBuildThreshold: (value: number) => void
  playBuildFlow: () => void
  resetBuildNetwork: () => void
  autofillBuildDemo: () => void
  setInspector: (inspector: InspectorState | null) => void
  setHighlightEdgeId: (id: string | null) => void
  setTraceAnswerOne: (value: string) => void
  runTraceTestOne: () => void
  setTraceAnswerTwo: (value: string) => void
  setTraceWeight: (value: number) => void
  applyTraceWeight: () => void
  setMissionReplaySelection: (value: string) => void
}

export const useLessonStore = create<LessonStore>((set) => ({
  ...createLessonState(),
  guidedMode: 'guided',
  showOnboarding: true,
  hasSeenOnboarding: false,
  helpOpen: false,
  toastMessage: null,
  setStage: (stageId) =>
    set({
      currentStageId: stageId,
      inspector: null,
      highlightEdgeId: null,
      helpOpen: false,
    }),
  goNext: () =>
    set((state) => {
      const index = stageList.findIndex((stage) => stage.id === state.currentStageId)
      return {
        currentStageId: stageList[Math.min(stageList.length - 1, index + 1)].id,
        inspector: null,
        highlightEdgeId: null,
        helpOpen: false,
      }
    }),
  goPrevious: () =>
    set((state) => {
      const index = stageList.findIndex((stage) => stage.id === state.currentStageId)
      return {
        currentStageId: stageList[Math.max(0, index - 1)].id,
        inspector: null,
        highlightEdgeId: null,
        helpOpen: false,
      }
    }),
  resetLesson: () =>
    set((state) => ({
      ...createLessonState(),
      guidedMode: state.guidedMode,
      showOnboarding: false,
      hasSeenOnboarding: state.hasSeenOnboarding,
      helpOpen: false,
      toastMessage: null,
    })),
  restartWithGuide: () =>
    set({
      ...createLessonState(),
      guidedMode: 'guided',
      showOnboarding: true,
      hasSeenOnboarding: true,
      helpOpen: false,
      toastMessage: null,
    }),
  startGuidedMode: () =>
    set({
      guidedMode: 'guided',
      showOnboarding: false,
      hasSeenOnboarding: true,
      helpOpen: false,
      toastMessage: '已进入引导模式。页面会告诉你下一步该操作什么。',
    }),
  startFreeMode: () =>
    set({
      guidedMode: 'free',
      showOnboarding: false,
      hasSeenOnboarding: true,
      helpOpen: false,
      toastMessage: '已进入自由探索模式。任务条、图例和帮助入口仍会保留。',
    }),
  setHelpOpen: (value) => set({ helpOpen: value }),
  clearToast: () => set({ toastMessage: null }),
  markStageIntroSeen: (stageId) =>
    set((state) => ({
      seenStageIntro: appendUnique(state.seenStageIntro, stageId),
    })),
  setTeacherMode: (value) => set({ teacherMode: value }),
  setChallengeModel: (patch) =>
    set((state) => ({
      challengeModel: { ...state.challengeModel, ...patch },
      challengeChecked: false,
      completedActions: appendUnique(state.completedActions, 'challenge-drag-boundary'),
    })),
  setChallengePrediction: (value) =>
    set((state) => ({
      challengePrediction: value,
      completedActions: appendUnique(state.completedActions, 'challenge-prediction'),
    })),
  runChallengeCheck: () =>
    set((state) => {
      if (!state.challengePrediction) {
        return state
      }

      return {
        challengeChecked: true,
        completedActions: appendUnique(state.completedActions, 'challenge-run-check'),
        toastMessage: '你已经完成了一次完整的“预测—检验”闭环。',
        engagement: {
          ...state.engagement,
          challengeInsight: state.challengePrediction === 'no',
        },
      }
    }),
  setProbePoint: (point) =>
    set((state) => ({
      probePoint: point,
      completedActions: appendUnique(state.completedActions, 'io-drag-probe'),
      engagement: { ...state.engagement, movedProbe: true },
    })),
  selectHiddenUnit: (id) =>
    set((state) => ({
      selectedHiddenUnitId: id,
      inspector: null,
      completedActions:
        id === 'H1'
          ? appendUnique(state.completedActions, 'hidden-view-h1')
          : id === 'H2'
            ? appendUnique(state.completedActions, 'hidden-view-h2')
            : state.completedActions,
      engagement: {
        ...state.engagement,
        openedHiddenUnits: Array.from(new Set([...state.engagement.openedHiddenUnits, id])),
      },
    })),
  setActivationMode: (mode) =>
    set((state) => ({
      activationMode: mode,
      completedActions:
        mode !== 'relu' || state.engagement.comparedActivationModes
          ? appendUnique(state.completedActions, 'activation-toggle-once')
          : state.completedActions,
      engagement: {
        ...state.engagement,
        comparedActivationModes:
          state.engagement.comparedActivationModes || mode !== 'relu',
      },
      toastMessage:
        mode !== 'relu'
          ? '你已经看到：只是堆叠线性层，并不会自动变成更强的边界。'
          : state.toastMessage,
    })),
  setIntuitionView: (value) => set({ intuitionView: value }),
  setBuildUnit: (id, patch) =>
    set((state) => {
      const actionMap: Record<HiddenUnitId, GuideActionId> = {
        H1: 'build-boundary-1',
        H2: 'build-boundary-2',
        H3: 'build-boundary-3',
        H4: 'build-boundary-4',
      }

      return {
        buildUnits: state.buildUnits.map((unit) =>
          unit.id === id ? { ...unit, ...patch } : unit,
        ),
        completedActions: appendUnique(state.completedActions, actionMap[id]),
        engagement: { ...state.engagement, usedBuildStep: true },
      }
    }),
  selectBuildUnit: (id) => set({ selectedBuildUnitId: id, inspector: null }),
  setBuildThreshold: (value) =>
    set((state) => ({
      buildThreshold: value,
      completedActions: appendUnique(state.completedActions, 'build-threshold'),
    })),
  playBuildFlow: () => set((state) => ({ buildPlaySeed: state.buildPlaySeed + 1 })),
  resetBuildNetwork: () =>
    set({
      buildUnits: initialBuildUnits,
      selectedBuildUnitId: 'H1',
      buildThreshold: 3.05,
    }),
  autofillBuildDemo: () =>
    set((state) => ({
      buildUnits: demoHiddenUnits,
      selectedBuildUnitId: 'H1',
      buildThreshold: 3.15,
      toastMessage: '已自动填入一个可用示范解。你可以继续拖动探针点，观察网络如何响应。',
      completedActions: [
        ...state.completedActions,
        'build-boundary-1',
        'build-boundary-2',
        'build-boundary-3',
        'build-boundary-4',
        'build-threshold',
      ].filter((actionId, index, list) => list.indexOf(actionId) === index) as GuideActionId[],
    })),
  setInspector: (inspector) => set({ inspector }),
  setHighlightEdgeId: (id) => set({ highlightEdgeId: id }),
  setTraceAnswerOne: (value) => set({ traceAnswerOne: value }),
  runTraceTestOne: () =>
    set((state) => {
      if (!state.traceAnswerOne) {
        return state
      }

      return {
        traceTestOne: true,
        completedActions: appendUnique(state.completedActions, 'trace-task-1'),
        toastMessage: '第一项因果追踪已经开始：先出现局部变化，再影响后续部分。',
      }
    }),
  setTraceAnswerTwo: (value) => set({ traceAnswerTwo: value }),
  setTraceWeight: (value) => set({ traceWeight: value }),
  applyTraceWeight: () =>
    set((state) => {
      if (!state.traceAnswerTwo) {
        return state
      }

      return {
        traceApplied: true,
        completedActions: appendUnique(state.completedActions, 'trace-task-2'),
        toastMessage: '第二项因果追踪已完成。注意：输入本身没有被后面的改动反向修改。',
        engagement: { ...state.engagement, completedTrace: true },
      }
    }),
  setMissionReplaySelection: (value) =>
    set((state) => ({
      missionReplaySelection: value,
      completedActions: appendUnique(state.completedActions, 'summary-replay'),
    })),
}))
