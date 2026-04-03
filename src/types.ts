export type LessonStageId =
  | 'challenge'
  | 'io'
  | 'hidden'
  | 'activation'
  | 'build'
  | 'trace'
  | 'summary'

export type LessonStageMeta = {
  id: LessonStageId
  stepNumber: number
  titleEn: string
  titleZh: string
  shortHint: string
  headline: string
  description: string
}

export type Point2D = {
  x: number
  y: number
}

export type LabeledPoint = Point2D & {
  id: string
  isSafe: boolean
}

export type ChallengeModel = {
  wx: number
  wy: number
  bias: number
}

export type HiddenUnitId = 'H1' | 'H2' | 'H3' | 'H4'

export type HiddenUnitConfig = {
  id: HiddenUnitId
  angle: number
  offset: number
  side: 1 | -1
  label: string
  accent: string
}

export type ActivationMode = 'off' | 'relu'

export type GuideMode = 'guided' | 'free'

export type GuideActionId =
  | 'challenge-prediction'
  | 'challenge-drag-boundary'
  | 'challenge-run-check'
  | 'io-drag-probe'
  | 'hidden-view-h1'
  | 'hidden-view-h2'
  | 'activation-toggle-once'
  | 'build-boundary-1'
  | 'build-boundary-2'
  | 'build-boundary-3'
  | 'build-boundary-4'
  | 'build-threshold'
  | 'trace-task-1'
  | 'trace-task-2'
  | 'summary-replay'

export type FocusTarget =
  | 'top-bar'
  | 'task-strip'
  | 'challenge-boundary'
  | 'challenge-predictions'
  | 'challenge-run-check'
  | 'probe-point'
  | 'hidden-unit-h1'
  | 'hidden-unit-h2'
  | 'activation-toggle'
  | 'build-unit-h1'
  | 'build-unit-h2'
  | 'build-unit-h3'
  | 'build-unit-h4'
  | 'build-threshold'
  | 'build-example'
  | 'trace-question-1'
  | 'trace-question-2'
  | 'summary-replay'
  | null

export type StageTaskStrip = {
  showing: string
  goal: string
  action: string
}

export type GuideStep = {
  id: string
  title: string
  requiredActionIds: GuideActionId[]
  focusTarget: FocusTarget
  hint: string
  completionToast?: string
  bridgeText?: string
}

export type HelpTopic = {
  stageId: LessonStageId
  title: string
  body: string
}

export type InspectorLine = {
  label: string
  value: string
}

export type InspectorState = {
  title: string
  subtitle?: string
  x: number
  y: number
  lines: InspectorLine[]
  interpretation: string
}

export type ConceptCard = {
  title: string
  body: string
  tone?: 'info' | 'warning' | 'success'
}

export type EngagementState = {
  movedProbe: boolean
  openedHiddenUnits: HiddenUnitId[]
  comparedActivationModes: boolean
  usedBuildStep: boolean
  completedTrace: boolean
  challengeInsight: boolean | null
}

export type UnderstandingProfile = {
  key: string
  label: string
  value: number | null
  note: string
}[]
