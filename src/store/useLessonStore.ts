import { create } from 'zustand'
import {
  defaultProbePoint,
  demoHiddenUnits,
  initialBuildUnits,
} from '../data/dataset'
import { stageList } from '../data/learningFlowConfig'
import type {
  ActivationMode,
  ChallengeModel,
  EngagementState,
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

type LessonStore = {
  currentStageId: LessonStageId
  teacherMode: boolean
  challengeModel: ChallengeModel
  challengePrediction: 'yes' | 'no' | 'unsure' | null
  challengeChecked: boolean
  probePoint: Point2D
  selectedHiddenUnitId: HiddenUnitId
  activationMode: ActivationMode
  intuitionView: boolean
  buildUnits: HiddenUnitConfig[]
  selectedBuildUnitId: HiddenUnitId
  buildThreshold: number
  buildPlaySeed: number
  buildGuideStep: number
  inspector: InspectorState | null
  highlightEdgeId: string | null
  traceAnswerOne: string | null
  traceTestOne: boolean
  traceAnswerTwo: string | null
  traceWeight: number
  traceApplied: boolean
  engagement: EngagementState
  setStage: (stageId: LessonStageId) => void
  goNext: () => void
  goPrevious: () => void
  resetLesson: () => void
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
  stepBuildGuide: () => void
  resetBuildNetwork: () => void
  autofillBuildDemo: () => void
  setInspector: (inspector: InspectorState | null) => void
  setHighlightEdgeId: (id: string | null) => void
  setTraceAnswerOne: (value: string) => void
  runTraceTestOne: () => void
  setTraceAnswerTwo: (value: string) => void
  setTraceWeight: (value: number) => void
  applyTraceWeight: () => void
}

export const useLessonStore = create<LessonStore>((set) => ({
  currentStageId: 'challenge',
  teacherMode: false,
  challengeModel: initialChallengeModel,
  challengePrediction: null,
  challengeChecked: false,
  probePoint: defaultProbePoint,
  selectedHiddenUnitId: 'H1',
  activationMode: 'relu',
  intuitionView: false,
  buildUnits: initialBuildUnits,
  selectedBuildUnitId: 'H1',
  buildThreshold: 3.05,
  buildPlaySeed: 0,
  buildGuideStep: 0,
  inspector: null,
  highlightEdgeId: null,
  traceAnswerOne: null,
  traceTestOne: false,
  traceAnswerTwo: null,
  traceWeight: 0.85,
  traceApplied: false,
  engagement: initialEngagement,
  setStage: (stageId) => set({ currentStageId: stageId, inspector: null }),
  goNext: () =>
    set((state) => {
      const index = stageList.findIndex((stage) => stage.id === state.currentStageId)
      return {
        currentStageId: stageList[Math.min(stageList.length - 1, index + 1)].id,
        inspector: null,
      }
    }),
  goPrevious: () =>
    set((state) => {
      const index = stageList.findIndex((stage) => stage.id === state.currentStageId)
      return {
        currentStageId: stageList[Math.max(0, index - 1)].id,
        inspector: null,
      }
    }),
  resetLesson: () =>
    set({
      currentStageId: 'challenge',
      teacherMode: false,
      challengeModel: initialChallengeModel,
      challengePrediction: null,
      challengeChecked: false,
      probePoint: defaultProbePoint,
      selectedHiddenUnitId: 'H1',
      activationMode: 'relu',
      intuitionView: false,
      buildUnits: initialBuildUnits,
      selectedBuildUnitId: 'H1',
      buildThreshold: 3.05,
      buildPlaySeed: 0,
      buildGuideStep: 0,
      inspector: null,
      highlightEdgeId: null,
      traceAnswerOne: null,
      traceTestOne: false,
      traceAnswerTwo: null,
      traceWeight: 0.85,
      traceApplied: false,
      engagement: initialEngagement,
    }),
  setTeacherMode: (value) => set({ teacherMode: value }),
  setChallengeModel: (patch) =>
    set((state) => ({
      challengeModel: { ...state.challengeModel, ...patch },
      challengeChecked: false,
    })),
  setChallengePrediction: (value) => set({ challengePrediction: value }),
  runChallengeCheck: () =>
    set((state) => ({
      challengeChecked: true,
      engagement: {
        ...state.engagement,
        challengeInsight: state.challengePrediction === 'no',
      },
    })),
  setProbePoint: (point) =>
    set((state) => ({
      probePoint: point,
      engagement: { ...state.engagement, movedProbe: true },
    })),
  selectHiddenUnit: (id) =>
    set((state) => ({
      selectedHiddenUnitId: id,
      inspector: null,
      engagement: {
        ...state.engagement,
        openedHiddenUnits: Array.from(new Set([...state.engagement.openedHiddenUnits, id])),
      },
    })),
  setActivationMode: (mode) =>
    set((state) => ({
      activationMode: mode,
      engagement: {
        ...state.engagement,
        comparedActivationModes:
          state.engagement.comparedActivationModes || mode !== 'relu',
      },
    })),
  setIntuitionView: (value) => set({ intuitionView: value }),
  setBuildUnit: (id, patch) =>
    set((state) => ({
      buildUnits: state.buildUnits.map((unit) =>
        unit.id === id ? { ...unit, ...patch } : unit,
      ),
    })),
  selectBuildUnit: (id) => set({ selectedBuildUnitId: id, inspector: null }),
  setBuildThreshold: (value) => set({ buildThreshold: value }),
  playBuildFlow: () => set((state) => ({ buildPlaySeed: state.buildPlaySeed + 1 })),
  stepBuildGuide: () =>
    set((state) => ({
      buildGuideStep: (state.buildGuideStep + 1) % 5,
      selectedBuildUnitId:
        state.buildGuideStep >= 3
          ? 'H4'
          : (['H1', 'H2', 'H3', 'H4'][(state.buildGuideStep + 1) % 4] as HiddenUnitId),
      engagement: { ...state.engagement, usedBuildStep: true },
    })),
  resetBuildNetwork: () =>
    set({
      buildUnits: initialBuildUnits,
      selectedBuildUnitId: 'H1',
      buildThreshold: 3.05,
      buildGuideStep: 0,
    }),
  autofillBuildDemo: () =>
    set({
      buildUnits: demoHiddenUnits,
      selectedBuildUnitId: 'H1',
      buildThreshold: 3.15,
      buildGuideStep: 4,
    }),
  setInspector: (inspector) => set({ inspector }),
  setHighlightEdgeId: (id) => set({ highlightEdgeId: id }),
  setTraceAnswerOne: (value) => set({ traceAnswerOne: value }),
  runTraceTestOne: () => set({ traceTestOne: true }),
  setTraceAnswerTwo: (value) => set({ traceAnswerTwo: value }),
  setTraceWeight: (value) => set({ traceWeight: value }),
  applyTraceWeight: () =>
    set((state) => ({
      traceApplied: true,
      engagement: { ...state.engagement, completedTrace: true },
    })),
}))
