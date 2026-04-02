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
