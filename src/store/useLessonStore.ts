import { create } from 'zustand'
import { defaultProbePoint, demoHiddenUnits, initialBuildUnits, samplePoints } from '../data/dataset'
import { stageList } from '../data/learningFlowConfig'
import { practiceQuestions, practiceTokens } from '../data/practiceConfig'
import { scoreBuildNetwork } from '../lib/networkMath'
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
  PracticeAnswerState,
  PracticeBoundaryState,
  PracticeMatchingState,
  PracticeQuestionId,
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

function createPracticeState() {
  return {
    practiceQuestionIndex: 0,
    practiceAnswers: {
      q1: { selectedOptionId: null, submitted: false, isCorrect: null } as PracticeAnswerState,
      q2: { selectedOptionId: null, submitted: false, isCorrect: null } as PracticeAnswerState,
      q4: { selectedOptionId: null, submitted: false, isCorrect: null } as PracticeAnswerState,
    },
    practiceMatching: {
      matches: Object.fromEntries(practiceTokens.map((token) => [token, null])),
      selectedTokenId: null,
      submitted: false,
      isCorrect: null,
    } as PracticeMatchingState,
    practiceBoundary: {
      angle: demoHiddenUnits[3].angle + 0.55,
      offset: demoHiddenUnits[3].offset + 1.35,
      side: demoHiddenUnits[3].side,
      touched: false,
      touchCount: 0,
      hintVisible: false,
      submitted: false,
      isCorrect: null,
      locked: false,
    } as PracticeBoundaryState,
  }
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
    ...createPracticeState(),
  }
}

function appendUnique<T>(items: T[], item: T) {
  return items.includes(item) ? items : [...items, item]
}

function getPracticeQuestion(id: PracticeQuestionId) {
  return practiceQuestions.find((question) => question.id === id)
}

function normalizeAngleDiff(a: number, b: number) {
  let diff = a - b
  while (diff > Math.PI) diff -= Math.PI * 2
  while (diff < -Math.PI) diff += Math.PI * 2
  return Math.abs(diff)
}

function getPracticeBoundaryMismatches(boundary: PracticeBoundaryState) {
  const units = [...demoHiddenUnits.slice(0, 3), { ...demoHiddenUnits[3], angle: boundary.angle, offset: boundary.offset, side: boundary.side }]
  return samplePoints.reduce((sum, point) => {
    const predicted = scoreBuildNetwork(point, units, 3.15) >= 0
    return sum + Number(predicted !== point.isSafe)
  }, 0)
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
  setPracticeQuestionIndex: (index: number) => void
  nextPracticeQuestion: () => void
  previousPracticeQuestion: () => void
  restartPractice: () => void
  selectPracticeOption: (questionId: 'q1' | 'q2' | 'q4', optionId: string) => void
  submitPracticeQuestion: (questionId: PracticeQuestionId) => void
  resetPracticeQuestion: (questionId: PracticeQuestionId) => void
  selectPracticeToken: (tokenId: string | null) => void
  assignPracticeToken: (tokenId: string, targetId: string) => void
  updatePracticeBoundary: (patch: Partial<Pick<PracticeBoundaryState, 'angle' | 'offset' | 'side'>>) => void
  nudgePracticeBoundary: (field: 'angle' | 'offset', delta: number) => void
  setPracticeBoundarySide: (side: 1 | -1) => void
  revealPracticeBoundaryHint: () => void
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
  setPracticeQuestionIndex: (index) =>
    set({
      practiceQuestionIndex: Math.max(0, Math.min(practiceQuestions.length, index)),
      inspector: null,
      highlightEdgeId: null,
    }),
  nextPracticeQuestion: () =>
    set((state) => ({
      practiceQuestionIndex: Math.min(practiceQuestions.length, state.practiceQuestionIndex + 1),
      inspector: null,
      highlightEdgeId: null,
    })),
  previousPracticeQuestion: () =>
    set((state) => ({
      practiceQuestionIndex: Math.max(0, state.practiceQuestionIndex - 1),
      inspector: null,
      highlightEdgeId: null,
    })),
  restartPractice: () =>
    set({
      ...createPracticeState(),
      toastMessage: '练习测试已重置。你可以重新体验这 5 道短题。',
    }),
  selectPracticeOption: (questionId, optionId) =>
    set((state) => ({
      practiceAnswers: {
        ...state.practiceAnswers,
        [questionId]: {
          ...state.practiceAnswers[questionId],
          selectedOptionId: optionId,
        },
      },
    })),
  submitPracticeQuestion: (questionId) =>
    set((state) => {
      if (questionId === 'q3') {
        const correctMap = getPracticeQuestion('q3')?.correctAnswer as Record<string, string>
        const isCorrect = practiceTokens.every(
          (token) => state.practiceMatching.matches[token] === correctMap[token],
        )
        return {
          practiceMatching: {
            ...state.practiceMatching,
            submitted: true,
            isCorrect,
          },
          toastMessage: isCorrect
            ? '这题已经作答完成。你把结构与作用的对应关系串起来了。'
            : '这题已提交。先别急着记名词，再想一想它们各自负责什么。',
        }
      }

      if (questionId === 'q5') {
        const rule = getPracticeQuestion('q5')?.validationRule
        const mismatchCount = getPracticeBoundaryMismatches(state.practiceBoundary)
        const isCorrect = Boolean(
          rule &&
            normalizeAngleDiff(state.practiceBoundary.angle, rule.targetAngle ?? 0) <=
              (rule.angleTolerance ?? 0.42) &&
            Math.abs(state.practiceBoundary.offset - (rule.targetOffset ?? 0)) <=
              (rule.offsetTolerance ?? 0.7) &&
            state.practiceBoundary.side === (rule.requiredSide ?? 1) &&
            mismatchCount <= (rule.maxMismatches ?? 4),
        )

        return {
          practiceBoundary: {
            ...state.practiceBoundary,
            submitted: true,
            isCorrect,
            locked: isCorrect,
          },
          toastMessage: isCorrect
            ? '最后一个检测条件已经补上，剩余错分点数也降下来了。'
            : '这题已提交。当前边界方向还不太对，可以重新作答后再调一调。',
        }
      }

      const currentAnswer = state.practiceAnswers[questionId as 'q1' | 'q2' | 'q4']
      const correctAnswer = getPracticeQuestion(questionId)?.correctAnswer as string
      if (!currentAnswer.selectedOptionId) {
        return state
      }

      const isCorrect = currentAnswer.selectedOptionId === correctAnswer

      return {
        practiceAnswers: {
          ...state.practiceAnswers,
          [questionId]: {
            ...currentAnswer,
            submitted: true,
            isCorrect,
          },
        },
        toastMessage: isCorrect
          ? '这题答对了，说明对应的核心概念已经比较清楚。'
          : '这题已经提交。先看右侧解释，再决定是否重新作答。',
      }
    }),
  resetPracticeQuestion: (questionId) =>
    set((state) => {
      if (questionId === 'q3') {
        return {
          practiceMatching: createPracticeState().practiceMatching,
        }
      }

      if (questionId === 'q5') {
        return {
          practiceBoundary: createPracticeState().practiceBoundary,
        }
      }

      return {
        practiceAnswers: {
          ...state.practiceAnswers,
          [questionId]: {
            selectedOptionId: null,
            submitted: false,
            isCorrect: null,
          },
        },
      }
    }),
  selectPracticeToken: (tokenId) =>
    set((state) => ({
      practiceMatching: {
        ...state.practiceMatching,
        selectedTokenId: tokenId,
      },
    })),
  assignPracticeToken: (tokenId, targetId) =>
    set((state) => {
      const nextMatches = { ...state.practiceMatching.matches }

      for (const [token, target] of Object.entries(nextMatches)) {
        if (target === targetId && token !== tokenId) {
          nextMatches[token] = null
        }
      }

      nextMatches[tokenId] = targetId

      return {
        practiceMatching: {
          ...state.practiceMatching,
          matches: nextMatches,
          selectedTokenId: null,
        },
      }
    }),
  updatePracticeBoundary: (patch) =>
    set((state) => ({
      practiceBoundary: {
        ...state.practiceBoundary,
        ...patch,
        touched: true,
        touchCount: state.practiceBoundary.touchCount + 1,
        submitted: false,
        isCorrect: null,
      },
    })),
  nudgePracticeBoundary: (field, delta) =>
    set((state) => ({
      practiceBoundary: {
        ...state.practiceBoundary,
        [field]: state.practiceBoundary[field] + delta,
        touched: true,
        touchCount: state.practiceBoundary.touchCount + 1,
        submitted: false,
        isCorrect: null,
      },
    })),
  setPracticeBoundarySide: (side) =>
    set((state) => ({
      practiceBoundary: {
        ...state.practiceBoundary,
        side,
        touched: true,
        touchCount: state.practiceBoundary.touchCount + 1,
        submitted: false,
        isCorrect: null,
      },
    })),
  revealPracticeBoundaryHint: () =>
    set((state) => ({
      practiceBoundary: {
        ...state.practiceBoundary,
        hintVisible: true,
      },
      toastMessage: '提示已显示。注意观察还没有被单独约束的那一侧边界。',
    })),
}))
