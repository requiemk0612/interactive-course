import { useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { demoHiddenUnits, mapBounds, safePolygon, samplePoints } from '../data/dataset'
import { practiceQuestions, practiceTargets, practiceTokens } from '../data/practiceConfig'
import {
  clamp,
  formatNumber,
  fromSvgToModel,
  getLineEndpoints,
  toSvgX,
  toSvgY,
} from '../lib/geometry'
import {
  getChallengeScore,
  getHiddenActivation,
  getLinearCollapsedBoundary,
  getUnitWeights,
  scoreBuildNetwork,
} from '../lib/networkMath'
import type {
  PracticeAnswerState,
  PracticeBoundaryState,
  PracticeMatchingState,
  PracticeQuestionId,
} from '../types'

const size = 440
const minimalQuestionBoundary = { wx: 0.85, wy: -0.58, bias: 0.18 }
const practiceThreshold = 3.15

type PracticeStageProps = {
  questionIndex: number
  answers: {
    q1: PracticeAnswerState
    q2: PracticeAnswerState
    q4: PracticeAnswerState
  }
  matching: PracticeMatchingState
  boundary: PracticeBoundaryState
  onSetQuestionIndex: (index: number) => void
  onNextQuestion: () => void
  onPreviousQuestion: () => void
  onRestartPractice: () => void
  onSelectOption: (questionId: 'q1' | 'q2' | 'q4', optionId: string) => void
  onSubmitQuestion: (questionId: PracticeQuestionId) => void
  onResetQuestion: (questionId: PracticeQuestionId) => void
  onSelectToken: (tokenId: string | null) => void
  onAssignToken: (tokenId: string, targetId: string) => void
  onUpdateBoundary: (patch: Partial<Pick<PracticeBoundaryState, 'angle' | 'offset' | 'side'>>) => void
  onNudgeBoundary: (field: 'angle' | 'offset', delta: number) => void
  onSetBoundarySide: (side: 1 | -1) => void
  onRevealBoundaryHint: () => void
  onJumpToLessonSummary: () => void
}

type BoundaryDragState =
  | { type: 'offset' }
  | { type: 'angle' }
  | null

export function PracticeStage({
  questionIndex,
  answers,
  matching,
  boundary,
  onSetQuestionIndex,
  onNextQuestion,
  onPreviousQuestion,
  onRestartPractice,
  onSelectOption,
  onSubmitQuestion,
  onResetQuestion,
  onSelectToken,
  onAssignToken,
  onUpdateBoundary,
  onNudgeBoundary,
  onSetBoundarySide,
  onRevealBoundaryHint,
  onJumpToLessonSummary,
}: PracticeStageProps) {
  const [dragTokenId, setDragTokenId] = useState<string | null>(null)
  const [hoverTargetId, setHoverTargetId] = useState<string | null>(null)
  const [dragState, setDragState] = useState<BoundaryDragState>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const isSummary = questionIndex >= practiceQuestions.length
  const question = practiceQuestions[Math.min(questionIndex, practiceQuestions.length - 1)]

  const q5Units = useMemo(
    () => [
      ...demoHiddenUnits.slice(0, 3),
      { ...demoHiddenUnits[3], angle: boundary.angle, offset: boundary.offset, side: boundary.side },
    ],
    [boundary.angle, boundary.offset, boundary.side],
  )

  const q5MismatchCount = useMemo(
    () =>
      samplePoints.reduce((sum, point) => {
        const predicted = scoreBuildNetwork(point, q5Units, practiceThreshold) >= 0
        return sum + Number(predicted !== point.isSafe)
      }, 0),
    [q5Units],
  )

  const practiceSummary = useMemo(() => {
    const results = [
      answers.q1.isCorrect,
      answers.q2.isCorrect,
      matching.isCorrect,
      answers.q4.isCorrect,
      boundary.isCorrect,
    ]
    const correctCount = results.filter(Boolean).length

    return {
      correctCount,
      status:
        correctCount >= 5
          ? '你已经掌握主要概念'
          : correctCount >= 3
            ? '基础理解已经建立'
            : '已经完成第一轮理解，建议回看关键环节',
      recapWeights: {
        linear: Number(Boolean(answers.q1.isCorrect)),
        hidden:
          Number(Boolean(matching.isCorrect)) +
          Number(Boolean(answers.q4.isCorrect)) +
          Number(Boolean(boundary.isCorrect)),
        activation: Number(Boolean(answers.q2.isCorrect)),
      },
      profile: [
        {
          key: 'linear-nonlinear',
          label: '线性与非线性直觉',
          value: [answers.q1.isCorrect, answers.q2.isCorrect].filter(Boolean).length / 2,
        },
        {
          key: 'structure-role',
          label: '结构角色理解',
          value: [matching.isCorrect, answers.q4.isCorrect].filter(Boolean).length / 2,
        },
        {
          key: 'build-sense',
          label: '简单搭建感知',
          value: boundary.isCorrect ? 1 : boundary.submitted ? 0.45 : 0,
        },
      ],
    }
  }, [
    answers.q1.isCorrect,
    answers.q2.isCorrect,
    answers.q4.isCorrect,
    boundary.isCorrect,
    boundary.submitted,
    matching.isCorrect,
  ])

  const currentState = getCurrentState(question.id)
  const canSubmit = getCanSubmit(question.id)

  const currentPanelCopy =
    !currentState.submitted
      ? question.preSubmitRightPanelCopy
      : {
          focusTitle: '结果反馈',
          focusBody: currentState.isCorrect
            ? question.postSubmitCorrectCopy
            : question.postSubmitIncorrectCopy,
          hintTitle: '为什么是这样',
          hintBody: question.postSubmitExplanationZh,
        }

  return (
    <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="space-y-6">
        <div className="glass-panel rounded-[34px] border border-white/8 p-5 lg:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-4xl">
              <p className="text-xs tracking-[0.22em] text-cyan-100/72">Reinforcement Practice</p>
              <h3 className="mt-2 font-display text-2xl tracking-[0.03em] text-slate-100 lg:text-[2rem]">
                {isSummary ? '你已经完成巩固练习' : question.titleZh}
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-300/90">
                {isSummary
                  ? '这一页会把你的练习过程收束成一个温和的回顾，不显示分数或排名。'
                  : question.instructionZh}
              </p>
              {!isSummary ? (
                <p className="mt-2 text-xs tracking-[0.08em] text-slate-400">
                  Use five short questions to check whether the key ideas are now clear.
                </p>
              ) : null}
            </div>
            <div className="min-w-[240px] rounded-[24px] border border-white/8 bg-white/[0.04] px-4 py-4">
              <div className="text-xs tracking-[0.16em] text-slate-400">练习进度</div>
              <div className="mt-3 flex gap-2">
                {practiceQuestions.map((_, index) => {
                  const active = index <= Math.min(questionIndex, practiceQuestions.length - 1)
                  return (
                    <div
                      key={index}
                      className={clsx(
                        'h-2 flex-1 rounded-full transition',
                        active
                          ? 'bg-gradient-to-r from-sky-300 via-cyan-300 to-cyan-100 shadow-[0_0_14px_rgba(103,232,249,0.18)]'
                          : 'bg-slate-800/90',
                      )}
                    />
                  )
                })}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300/90">
                {practiceQuestions.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => onSetQuestionIndex(index)}
                    className={clsx(
                      'rounded-full border px-3 py-1 transition',
                      index === questionIndex
                        ? 'border-cyan-300/35 bg-cyan-300/10 text-cyan-50'
                        : 'border-white/8 bg-black/20 text-slate-400 hover:border-slate-500 hover:text-slate-200',
                    )}
                  >
                    第 {index + 1} 题
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {!isSummary ? (
          <div className="glass-panel rounded-[34px] border border-white/8 p-5 lg:p-6">
            <div className="mb-5">
              <h4 className="font-display text-xl text-slate-100">{question.titleZh}</h4>
              <p className="mt-2 text-sm leading-7 text-slate-300/90">{question.instructionZh}</p>
              <p className="mt-4 text-base leading-8 text-slate-100/92">{question.promptZh}</p>
            </div>

            {question.id === 'q1' ? renderQuestionOne() : null}
            {question.id === 'q2' ? renderQuestionTwo() : null}
            {question.id === 'q3' ? renderQuestionThree() : null}
            {question.id === 'q4' ? renderQuestionFour() : null}
            {question.id === 'q5' ? renderQuestionFive() : null}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onResetQuestion(question.id)}
                className="text-sm text-slate-400 transition hover:text-slate-200"
              >
                重新作答
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onPreviousQuestion}
                  disabled={questionIndex === 0}
                  className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  上一题
                </button>
                <button
                  type="button"
                  onClick={() => onSubmitQuestion(question.id)}
                  disabled={!canSubmit || currentState.submitted}
                  className="primary-action rounded-2xl px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  提交本题
                </button>
                <button
                  type="button"
                  onClick={onNextQuestion}
                  disabled={!currentState.submitted}
                  className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {questionIndex === practiceQuestions.length - 1 ? '查看练习回顾' : '下一题'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          renderPracticeSummary()
        )}
      </section>

      {!isSummary ? (
        <aside className="glass-panel soft-scrollbar flex max-h-[calc(100vh-13rem)] flex-col overflow-y-auto rounded-[30px] border border-white/8">
          <div className="space-y-4 p-5">
            <div className="rounded-[24px] border border-white/8 bg-white/[0.035] px-4 py-4">
              <h4 className="font-display text-base tracking-[0.03em] text-slate-100">
                {currentPanelCopy.focusTitle}
              </h4>
              <p className="mt-2 text-sm leading-8 text-slate-300/92">
                {currentPanelCopy.focusBody}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-white/[0.035] px-4 py-4">
              <h4 className="font-display text-base tracking-[0.03em] text-slate-100">
                {currentPanelCopy.hintTitle}
              </h4>
              <p className="mt-2 text-sm leading-8 text-slate-300/92">
                {currentPanelCopy.hintBody}
              </p>
            </div>
          </div>
        </aside>
      ) : null}
    </div>
  )

  function getCurrentState(questionId: PracticeQuestionId) {
    if (questionId === 'q3') return matching
    if (questionId === 'q5') return boundary
    return answers[questionId as 'q1' | 'q2' | 'q4']
  }

  function getCanSubmit(questionId: PracticeQuestionId) {
    if (questionId === 'q3') {
      return practiceTokens.every((token) => Boolean(matching.matches[token]))
    }
    if (questionId === 'q5') {
      return boundary.touched
    }
    return Boolean(answers[questionId as 'q1' | 'q2' | 'q4'].selectedOptionId)
  }

  function getOptionClass(questionId: 'q1' | 'q2' | 'q4', optionId: string) {
    const state = answers[questionId]
    const correctAnswer = practiceQuestions.find((item) => item.id === questionId)?.correctAnswer as string
    if (!state.submitted) {
      return state.selectedOptionId === optionId
        ? 'border-cyan-300/45 bg-cyan-300/[0.12] text-slate-100 shadow-[0_0_22px_rgba(34,211,238,0.14)]'
        : 'border-white/8 bg-black/20 text-slate-300/92 hover:border-slate-500 hover:bg-white/[0.05]'
    }

    if (optionId === correctAnswer) {
      return 'border-emerald-300/28 bg-emerald-300/[0.11] text-emerald-50'
    }

    if (state.selectedOptionId === optionId && !state.isCorrect) {
      return 'border-amber-300/28 bg-amber-300/[0.11] text-amber-50'
    }

    return 'border-white/8 bg-black/20 text-slate-400'
  }

  function renderChoiceList(questionId: 'q1' | 'q2' | 'q4') {
    const questionConfig = practiceQuestions.find((item) => item.id === questionId)!
    return (
      <div className="mt-5 space-y-3">
        {questionConfig.options?.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelectOption(questionId, option.id)}
            disabled={answers[questionId].submitted}
            className={clsx(
              'w-full rounded-[22px] border px-4 py-4 text-left transition',
              getOptionClass(questionId, option.id),
            )}
          >
            <div className="font-medium leading-7">{option.labelZh}</div>
          </button>
        ))}
      </div>
    )
  }

  function renderQuestionOne() {
    const line = getLineEndpoints(
      minimalQuestionBoundary.wx,
      minimalQuestionBoundary.wy,
      minimalQuestionBoundary.bias,
      mapBounds,
    )

    return (
      <div className="grid gap-5 xl:grid-cols-[0.96fr_1.04fr]">
        <div className="glass-panel rounded-[28px] border border-white/8 p-4">
          <svg viewBox="0 0 100 100" className="h-[280px] w-full">
            <circle cx="18" cy="34" r="7" fill="#f8fafc" />
            <circle cx="18" cy="66" r="7" fill="#f8fafc" />
            <circle cx="80" cy="50" r="8" fill="#f8fafc" />
            <line x1="25" y1="34" x2="72" y2="50" stroke="rgba(148,163,184,0.6)" strokeWidth="1.1" />
            <line x1="25" y1="66" x2="72" y2="50" stroke="rgba(148,163,184,0.6)" strokeWidth="1.1" />
            <text x="18" y="36" textAnchor="middle" className="fill-ink-950 text-[4px] font-bold">x</text>
            <text x="18" y="68" textAnchor="middle" className="fill-ink-950 text-[4px] font-bold">y</text>
            <text x="80" y="52" textAnchor="middle" className="fill-ink-950 text-[3.6px] font-bold">out</text>
            <text x="80" y="66" textAnchor="middle" className="fill-slate-300 text-[3.4px]">降落判断</text>
          </svg>
        </div>
        <div className="glass-panel rounded-[28px] border border-white/8 p-4">
          {renderMapFrame({ line, pulseMisclassified: answers.q1.submitted })}
        </div>
        <div className="xl:col-span-2">{renderChoiceList('q1')}</div>
      </div>
    )
  }

  function renderQuestionTwo() {
    const collapsed = getLinearCollapsedBoundary(
      demoHiddenUnits,
      [1.15, -0.6, 0.9, -0.5],
      -0.25,
    )
    const offLine = getLineEndpoints(collapsed.wx, collapsed.wy, collapsed.bias, mapBounds)

    return (
      <div className="grid gap-5 xl:grid-cols-[0.96fr_1.04fr]">
        <div className="glass-panel rounded-[28px] border border-white/8 p-4">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="rounded-full border border-amber-300/18 bg-amber-300/10 px-3 py-1 text-xs text-amber-50/90">
              激活关闭
            </div>
            <div className="rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-50/90">
              激活开启
            </div>
          </div>
          <svg viewBox="0 0 100 100" className="h-[260px] w-full">
            <circle cx="16" cy="35" r="6.5" fill="#f8fafc" />
            <circle cx="16" cy="65" r="6.5" fill="#f8fafc" />
            {demoHiddenUnits.map((unit, index) => (
              <g key={unit.id}>
                <circle cx="50" cy={22 + index * 18} r="6.6" fill={unit.accent} />
                <line x1="23" y1="35" x2="43" y2={22 + index * 18} stroke="rgba(148,163,184,0.45)" strokeWidth="0.85" />
                <line x1="23" y1="65" x2="43" y2={22 + index * 18} stroke="rgba(148,163,184,0.45)" strokeWidth="0.85" />
                <line x1="57" y1={22 + index * 18} x2="83" y2="50" stroke="rgba(148,163,184,0.45)" strokeWidth="0.85" />
              </g>
            ))}
            <circle cx="88" cy="50" r="7.2" fill="#f8fafc" />
            <text x="88" y="52" textAnchor="middle" className="fill-ink-950 text-[3.6px] font-bold">out</text>
          </svg>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="glass-panel rounded-[28px] border border-white/8 p-4">
            <div className="mb-3 text-sm text-slate-200/90">激活关闭</div>
            {renderMapFrame({ line: offLine, compareMode: 'off', pulseMisclassified: answers.q2.submitted && !answers.q2.isCorrect })}
          </div>
          <div className="glass-panel rounded-[28px] border border-white/8 p-4">
            <div className="mb-3 text-sm text-slate-200/90">激活开启</div>
            {renderMapFrame({ line: null, compareMode: 'on', pulseMisclassified: answers.q2.submitted && Boolean(answers.q2.isCorrect) })}
          </div>
          <div className="sm:col-span-2">{renderChoiceList('q2')}</div>
        </div>
      </div>
    )
  }

  function renderQuestionThree() {
    const tokenAssignments = matching.matches
    const reverseAssignments = Object.fromEntries(
      practiceTargets.map((target) => [
        target,
        Object.entries(tokenAssignments).find(([, value]) => value === target)?.[0] ?? null,
      ]),
    ) as Record<string, string | null>

    return (
      <div className="glass-panel rounded-[30px] border border-white/8 p-5">
        <div className="relative grid gap-6 lg:grid-cols-[1fr_80px_1fr]">
          <div className="space-y-3">
            {practiceTokens.map((token, index) => (
              <button
                key={token}
                type="button"
                draggable={!matching.submitted}
                onDragStart={(event) => {
                  event.dataTransfer.setData('text/plain', token)
                  setDragTokenId(token)
                }}
                onDragEnd={() => setDragTokenId(null)}
                onClick={() => onSelectToken(matching.selectedTokenId === token ? null : token)}
                className={clsx(
                  'w-full rounded-full border px-4 py-4 text-left transition',
                  matching.selectedTokenId === token
                    ? 'border-cyan-300/45 bg-cyan-300/[0.12] text-slate-100 shadow-[0_0_22px_rgba(34,211,238,0.14)]'
                    : 'border-white/8 bg-white/[0.05] text-slate-100 hover:border-slate-500 hover:bg-white/[0.08]',
                )}
                style={{ transform: `translateY(${index * 2}px)` }}
              >
                {token}
              </button>
            ))}
          </div>

          <div className="relative hidden lg:block">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 80 320">
              {practiceTokens.map((token, tokenIndex) => {
                const targetId = tokenAssignments[token]
                if (!targetId) return null
                const targetIndex = practiceTargets.indexOf(targetId as (typeof practiceTargets)[number])
                return (
                  <line
                    key={token}
                    x1="8"
                    y1={40 + tokenIndex * 76}
                    x2="72"
                    y2={40 + targetIndex * 76}
                    stroke={matching.submitted ? '#34d399' : '#67e8f9'}
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.72"
                  />
                )
              })}
            </svg>
          </div>

          <div className="space-y-3">
            {practiceTargets.map((target) => {
              const assignedToken = reverseAssignments[target]
              const activeHover =
                hoverTargetId === target ||
                (matching.selectedTokenId &&
                  (practiceQuestions[2].correctAnswer as Record<string, string>)[matching.selectedTokenId] === target)

              return (
                <button
                  key={target}
                  type="button"
                  onDragOver={(event) => {
                    event.preventDefault()
                    setHoverTargetId(target)
                  }}
                  onDragLeave={() => setHoverTargetId(null)}
                  onDrop={(event) => {
                    event.preventDefault()
                    const tokenId = dragTokenId ?? event.dataTransfer.getData('text/plain')
                    if (tokenId) {
                      onAssignToken(tokenId, target)
                    }
                    setDragTokenId(null)
                    setHoverTargetId(null)
                  }}
                  onClick={() => {
                    if (matching.selectedTokenId) {
                      onAssignToken(matching.selectedTokenId, target)
                    }
                  }}
                  className={clsx(
                    'min-h-[72px] w-full rounded-[22px] border px-4 py-4 text-left transition',
                    assignedToken
                      ? matching.submitted
                        ? 'border-emerald-300/25 bg-emerald-300/[0.10] text-emerald-50'
                        : 'border-cyan-300/30 bg-cyan-300/[0.10] text-slate-100'
                      : activeHover
                        ? 'border-cyan-300/35 bg-cyan-300/[0.10] text-slate-100'
                        : 'border-white/8 bg-black/20 text-slate-300/92 hover:border-slate-500',
                  )}
                >
                  <div className="text-sm leading-7">{target}</div>
                  {assignedToken ? (
                    <div className="mt-2 text-xs text-slate-300/80">已对应：{assignedToken}</div>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  function renderQuestionFour() {
    return (
      <div className="grid gap-5 xl:grid-cols-[0.96fr_1.04fr]">
        <div className="glass-panel rounded-[28px] border border-white/8 p-4">
          <svg viewBox="0 0 100 100" className="h-[280px] w-full">
            <circle cx="16" cy="34" r="6.8" fill="#f8fafc" />
            <circle cx="16" cy="66" r="6.8" fill="#f8fafc" />
            {demoHiddenUnits.map((unit, index) => (
              <g key={unit.id}>
                <circle cx="50" cy={18 + index * 20} r="7" fill={unit.accent} className={answers.q4.submitted && answers.q4.isCorrect ? 'pulse-flow' : ''} />
                <line x1="23" y1="34" x2="43" y2={18 + index * 20} stroke="rgba(148,163,184,0.45)" strokeWidth="0.85" />
                <line x1="23" y1="66" x2="43" y2={18 + index * 20} stroke="rgba(148,163,184,0.45)" strokeWidth="0.85" />
                <line x1="57" y1={18 + index * 20} x2="82" y2="50" stroke="rgba(148,163,184,0.45)" strokeWidth="0.85" />
              </g>
            ))}
            <circle cx="88" cy="50" r="7.4" fill="#f8fafc" />
            <text x="88" y="52" textAnchor="middle" className="fill-ink-950 text-[3.6px] font-bold">out</text>
          </svg>
        </div>
        <div className="glass-panel rounded-[28px] border border-white/8 p-4">
          <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-4 rounded-[22px] border border-white/8 bg-black/20 p-4">
              <div className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-2 text-sm text-slate-200/90">输入坐标</div>
              <div className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-2 text-sm text-slate-200/90">隐藏响应</div>
              <div className="rounded-full border border-emerald-300/18 bg-emerald-300/10 px-3 py-2 text-sm text-emerald-50/90">最终判断</div>
            </div>
            <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
              <p className="text-sm leading-7 text-slate-300/90">
                输出层读取隐藏层已经形成的多个局部响应，并把它们整合成最终的“安全 / 不安全”判断。
              </p>
            </div>
          </div>
          {renderChoiceList('q4')}
        </div>
      </div>
    )
  }

  function renderQuestionFive() {
    const unitWeights = getUnitWeights({
      ...demoHiddenUnits[3],
      angle: boundary.angle,
      offset: boundary.offset,
      side: boundary.side,
    })
    const center = {
      x: Math.cos(boundary.angle) * boundary.offset,
      y: Math.sin(boundary.angle) * boundary.offset,
    }
    const rotateHandle = {
      x: center.x - Math.sin(boundary.angle) * 1.1,
      y: center.y + Math.cos(boundary.angle) * 1.1,
    }
    const activeLine = getLineEndpoints(unitWeights.wx, unitWeights.wy, unitWeights.bias, mapBounds)
    const threeUnitLines = demoHiddenUnits.slice(0, 3).map((unit) =>
      getLineEndpoints(getUnitWeights(unit).wx, getUnitWeights(unit).wy, getUnitWeights(unit).bias, mapBounds),
    )

    return (
      <div className="grid gap-5 xl:grid-cols-[0.96fr_1.04fr]">
        <div className="glass-panel rounded-[28px] border border-white/8 p-4">
          <svg viewBox="0 0 100 100" className="h-[300px] w-full">
            <circle cx="16" cy="34" r="6.8" fill="#f8fafc" />
            <circle cx="16" cy="66" r="6.8" fill="#f8fafc" />
            {demoHiddenUnits.map((unit, index) => {
              const isActive = index === 3
              return (
                <g key={unit.id}>
                  <circle
                    cx="50"
                    cy={18 + index * 20}
                    r={isActive ? 7.6 : 7}
                    fill={isActive ? unit.accent : 'rgba(226,232,240,0.7)'}
                  />
                  {isActive ? (
                    <circle cx="50" cy={18 + index * 20} r="10.6" fill="none" stroke={unit.accent} strokeWidth="1.6" opacity="0.38" />
                  ) : null}
                  <line x1="23" y1="34" x2="43" y2={18 + index * 20} stroke="rgba(148,163,184,0.45)" strokeWidth="0.85" />
                  <line x1="23" y1="66" x2="43" y2={18 + index * 20} stroke="rgba(148,163,184,0.45)" strokeWidth="0.85" />
                  <line x1="57" y1={18 + index * 20} x2="82" y2="50" stroke="rgba(148,163,184,0.45)" strokeWidth="0.85" />
                  <text x="50" y={20 + index * 20} textAnchor="middle" className="fill-ink-950 text-[3.6px] font-bold">
                    {unit.id}
                  </text>
                </g>
              )
            })}
            <circle cx="88" cy="50" r="7.4" fill="#f8fafc" />
            <text x="88" y="52" textAnchor="middle" className="fill-ink-950 text-[3.6px] font-bold">out</text>
          </svg>
        </div>

        <div className="glass-panel rounded-[28px] border border-white/8 p-4">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${size} ${size}`}
            className="h-[320px] w-full rounded-[24px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.84),rgba(2,6,23,0.98))]"
            onPointerMove={(event) => {
              if (!dragState) return
              const rect = svgRef.current?.getBoundingClientRect()
              if (!rect) return
              const point = fromSvgToModel(
                event.clientX - rect.left,
                event.clientY - rect.top,
                rect.width,
                rect.height,
                mapBounds.minX,
                mapBounds.maxX,
                mapBounds.minY,
                mapBounds.maxY,
              )
              if (dragState.type === 'offset') {
                onUpdateBoundary({
                  offset: clamp(
                    Math.cos(boundary.angle) * point.x + Math.sin(boundary.angle) * point.y,
                    -4,
                    4,
                  ),
                })
              } else {
                const angle = Math.atan2(point.y - center.y, point.x - center.x) - Math.PI / 2
                onUpdateBoundary({ angle })
              }
            }}
            onPointerUp={() => setDragState(null)}
            onPointerLeave={() => setDragState(null)}
          >
            <defs>
              <pattern id="practice-grid-q5" width="34" height="34" patternUnits="userSpaceOnUse">
                <path d="M 34 0 L 0 0 0 34" fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth="1" strokeDasharray="3 8" />
              </pattern>
            </defs>
            <rect width={size} height={size} fill="url(#practice-grid-q5)" />
            <path
              d={
                safePolygon
                  .map((point, index) => `${index === 0 ? 'M' : 'L'} ${toSvgX(point.x, size, mapBounds.minX, mapBounds.maxX)} ${toSvgY(point.y, size, mapBounds.minY, mapBounds.maxY)}`)
                  .join(' ') + ' Z'
              }
              fill="rgba(103,232,249,0.12)"
              stroke={boundary.hintVisible ? 'rgba(252,211,77,0.8)' : 'rgba(103,232,249,0.68)'}
              strokeWidth={boundary.hintVisible ? 3 : 2.3}
            />
            {threeUnitLines.map((segment, index) => (
              <line
                key={index}
                x1={toSvgX(segment[0].x, size, mapBounds.minX, mapBounds.maxX)}
                y1={toSvgY(segment[0].y, size, mapBounds.minY, mapBounds.maxY)}
                x2={toSvgX(segment[1].x, size, mapBounds.minX, mapBounds.maxX)}
                y2={toSvgY(segment[1].y, size, mapBounds.minY, mapBounds.maxY)}
                stroke={demoHiddenUnits[index].accent}
                strokeWidth={3}
                opacity={0.7}
              />
            ))}
            <line
              x1={toSvgX(activeLine[0].x, size, mapBounds.minX, mapBounds.maxX)}
              y1={toSvgY(activeLine[0].y, size, mapBounds.minY, mapBounds.maxY)}
              x2={toSvgX(activeLine[1].x, size, mapBounds.minX, mapBounds.maxX)}
              y2={toSvgY(activeLine[1].y, size, mapBounds.minY, mapBounds.maxY)}
              stroke={demoHiddenUnits[3].accent}
              strokeWidth={4}
              strokeLinecap="round"
              className={boundary.submitted && boundary.isCorrect ? 'boundary-travel' : ''}
            />
            {samplePoints.map((point) => {
              const svgX = toSvgX(point.x, size, mapBounds.minX, mapBounds.maxX)
              const svgY = toSvgY(point.y, size, mapBounds.minY, mapBounds.maxY)
              const predicted = scoreBuildNetwork(point, q5Units, practiceThreshold) >= 0
              const mismatch = predicted !== point.isSafe
              return (
                <g key={point.id}>
                  {mismatch ? (
                    <circle cx={svgX} cy={svgY} r={10} fill="none" stroke="rgba(252,211,77,0.28)" strokeWidth={2} />
                  ) : null}
                  <circle
                    cx={svgX}
                    cy={svgY}
                    r={point.isSafe ? 6 : 5}
                    fill={point.isSafe ? '#67e8f9' : '#f87171'}
                    stroke={mismatch ? '#fcd34d' : 'rgba(255,255,255,0.16)'}
                    strokeWidth={mismatch ? 2.6 : 1.4}
                  />
                </g>
              )
            })}
            <circle
              cx={toSvgX(center.x, size, mapBounds.minX, mapBounds.maxX)}
              cy={toSvgY(center.y, size, mapBounds.minY, mapBounds.maxY)}
              r={6}
              fill={demoHiddenUnits[3].accent}
              onPointerDown={(event) => {
                if (boundary.locked) return
                event.currentTarget.setPointerCapture(event.pointerId)
                setDragState({ type: 'offset' })
              }}
            />
            <circle
              cx={toSvgX(rotateHandle.x, size, mapBounds.minX, mapBounds.maxX)}
              cy={toSvgY(rotateHandle.y, size, mapBounds.minY, mapBounds.maxY)}
              r={6}
              fill="rgba(248,250,252,0.95)"
              stroke={demoHiddenUnits[3].accent}
              strokeWidth={2}
              onPointerDown={(event) => {
                if (boundary.locked) return
                event.currentTarget.setPointerCapture(event.pointerId)
                setDragState({ type: 'angle' })
              }}
            />
          </svg>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-[20px] border border-white/8 bg-black/20 px-4 py-3">
              <div className="text-xs tracking-[0.14em] text-slate-400">剩余错分点数</div>
              <div className="mt-2 font-mono tabular-nums text-lg text-slate-100">{q5MismatchCount}</div>
            </div>
            <div className="rounded-[20px] border border-white/8 bg-black/20 px-4 py-3">
              <div className="text-xs tracking-[0.14em] text-slate-400">角度</div>
              <div className="mt-2 font-mono tabular-nums text-lg text-slate-100">
                {formatNumber((boundary.angle * 180) / Math.PI)}°
              </div>
            </div>
            <div className="rounded-[20px] border border-white/8 bg-black/20 px-4 py-3">
              <div className="text-xs tracking-[0.14em] text-slate-400">位置</div>
              <div className="mt-2 font-mono tabular-nums text-lg text-slate-100">
                {formatNumber(boundary.offset)}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
              <div className="mb-3 text-sm text-slate-200/90">键盘微调角度</div>
              <div className="flex gap-2">
                <button type="button" onClick={() => onNudgeBoundary('angle', -0.08)} className="rounded-xl border border-white/8 bg-white/[0.05] px-3 py-2 text-sm text-slate-200">逆时针</button>
                <button type="button" onClick={() => onNudgeBoundary('angle', 0.08)} className="rounded-xl border border-white/8 bg-white/[0.05] px-3 py-2 text-sm text-slate-200">顺时针</button>
              </div>
            </div>
            <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
              <div className="mb-3 text-sm text-slate-200/90">键盘微调位置</div>
              <div className="flex gap-2">
                <button type="button" onClick={() => onNudgeBoundary('offset', -0.12)} className="rounded-xl border border-white/8 bg-white/[0.05] px-3 py-2 text-sm text-slate-200">向内</button>
                <button type="button" onClick={() => onNudgeBoundary('offset', 0.12)} className="rounded-xl border border-white/8 bg-white/[0.05] px-3 py-2 text-sm text-slate-200">向外</button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onSetBoundarySide(1)}
                className={clsx(
                  'rounded-full border px-3 py-2 text-sm transition',
                  boundary.side === 1
                    ? 'border-cyan-300/35 bg-cyan-300/10 text-cyan-50'
                    : 'border-white/8 bg-black/20 text-slate-300',
                )}
              >
                让这一侧更容易激活
              </button>
              <button
                type="button"
                onClick={() => onSetBoundarySide(-1)}
                className={clsx(
                  'rounded-full border px-3 py-2 text-sm transition',
                  boundary.side === -1
                    ? 'border-cyan-300/35 bg-cyan-300/10 text-cyan-50'
                    : 'border-white/8 bg-black/20 text-slate-300',
                )}
              >
                让对侧更容易激活
              </button>
            </div>
            {(boundary.touchCount > 6 || boundary.submitted) && !boundary.isCorrect ? (
              <button
                type="button"
                onClick={onRevealBoundaryHint}
                className="text-sm text-cyan-100/85 transition hover:text-cyan-50"
              >
                给我一点提示
              </button>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  function renderPracticeSummary() {
    return (
      <div className="glass-panel rounded-[34px] border border-white/8 p-6 lg:p-7">
        <h4 className="font-display text-3xl tracking-[0.03em] text-slate-100">
          你已经完成巩固练习
        </h4>
        <p className="mt-3 text-lg leading-8 text-cyan-50/90">{practiceSummary.status}</p>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {[
            { label: '单层网络的局限', active: practiceSummary.recapWeights.linear > 0 },
            { label: '隐藏层的中间特征作用', active: practiceSummary.recapWeights.hidden >= 2 },
            { label: '激活函数为什么重要', active: practiceSummary.recapWeights.activation > 0 },
          ].map((item) => (
            <div
              key={item.label}
              className={clsx(
                'rounded-[24px] border px-4 py-4',
                item.active
                  ? 'border-cyan-300/28 bg-cyan-300/[0.10] text-slate-100 shadow-[0_0_22px_rgba(34,211,238,0.12)]'
                  : 'border-white/8 bg-white/[0.035] text-slate-300/92',
              )}
            >
              <div className="font-display text-base">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[26px] border border-white/8 bg-white/[0.035] px-5 py-5">
          <h5 className="font-display text-lg text-slate-100">理解画像</h5>
          <p className="mt-2 text-xs leading-6 text-slate-400">
            这是根据你的练习过程生成的粗略画像，不是正式评分。
          </p>
          <div className="mt-5 space-y-4">
            {practiceSummary.profile.map((item) => (
              <div key={item.key}>
                <div className="flex items-center justify-between gap-3 text-sm text-slate-200/90">
                  <span>{item.label}</span>
                  <span className="font-mono tabular-nums text-xs text-slate-400">
                    {Math.round(item.value * 100)}%
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-800/90">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-sky-300 via-cyan-300 to-emerald-300"
                    style={{ width: `${item.value * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onJumpToLessonSummary}
            className="primary-action rounded-2xl px-5 py-3 text-sm font-semibold text-slate-950"
          >
            回顾课程重点
          </button>
          <button
            type="button"
            onClick={onRestartPractice}
            className="rounded-2xl border border-white/8 bg-white/[0.04] px-5 py-3 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-white/[0.08]"
          >
            重新练习
          </button>
        </div>
      </div>
    )
  }

  function renderMapFrame({
    line,
    compareMode,
    pulseMisclassified,
  }: {
    line: ReturnType<typeof getLineEndpoints> | null
    compareMode?: 'off' | 'on'
    pulseMisclassified?: boolean
  }) {
    const collapsed = getLinearCollapsedBoundary(
      demoHiddenUnits,
      [1.15, -0.6, 0.9, -0.5],
      -0.25,
    )
    const collapsedLine = getLineEndpoints(collapsed.wx, collapsed.wy, collapsed.bias, mapBounds)

    return (
      <svg viewBox={`0 0 ${size} ${size}`} className="h-[250px] w-full rounded-[24px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.84),rgba(2,6,23,0.98))]">
        <defs>
          <pattern id="practice-mini-grid" width="34" height="34" patternUnits="userSpaceOnUse">
            <path d="M 34 0 L 0 0 0 34" fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth="1" strokeDasharray="3 8" />
          </pattern>
        </defs>
        <rect width={size} height={size} fill="url(#practice-mini-grid)" />
        <path
          d={
            safePolygon
              .map((point, index) => `${index === 0 ? 'M' : 'L'} ${toSvgX(point.x, size, mapBounds.minX, mapBounds.maxX)} ${toSvgY(point.y, size, mapBounds.minY, mapBounds.maxY)}`)
              .join(' ') + ' Z'
          }
          fill="rgba(103,232,249,0.12)"
          stroke="rgba(103,232,249,0.68)"
          strokeWidth={2.2}
        />
        {compareMode === 'off' ? (
          <line
            x1={toSvgX(collapsedLine[0].x, size, mapBounds.minX, mapBounds.maxX)}
            y1={toSvgY(collapsedLine[0].y, size, mapBounds.minY, mapBounds.maxY)}
            x2={toSvgX(collapsedLine[1].x, size, mapBounds.minX, mapBounds.maxX)}
            y2={toSvgY(collapsedLine[1].y, size, mapBounds.minY, mapBounds.maxY)}
            stroke="#fcd34d"
            strokeWidth={4}
          />
        ) : null}
        {compareMode === 'on'
          ? samplePoints.map((point) => {
              const intensity = demoHiddenUnits.reduce((sum, unit) => sum + getHiddenActivation(point, unit), 0)
              return (
                <circle
                  key={`field-${point.id}`}
                  cx={toSvgX(point.x, size, mapBounds.minX, mapBounds.maxX)}
                  cy={toSvgY(point.y, size, mapBounds.minY, mapBounds.maxY)}
                  r={8 + Math.min(4, intensity * 2)}
                  fill="rgba(103,232,249,0.10)"
                />
              )
            })
          : null}
        {line ? (
          <line
            x1={toSvgX(line[0].x, size, mapBounds.minX, mapBounds.maxX)}
            y1={toSvgY(line[0].y, size, mapBounds.minY, mapBounds.maxY)}
            x2={toSvgX(line[1].x, size, mapBounds.minX, mapBounds.maxX)}
            y2={toSvgY(line[1].y, size, mapBounds.minY, mapBounds.maxY)}
            stroke="#60a5fa"
            strokeWidth={4}
            className={pulseMisclassified ? 'boundary-travel' : ''}
          />
        ) : null}
        {samplePoints.map((point) => {
          const predicted = line
            ? getChallengeScore(point, minimalQuestionBoundary) >= 0
            : scoreBuildNetwork(point, demoHiddenUnits, practiceThreshold) >= 0
          const mismatch = pulseMisclassified && predicted !== point.isSafe
          return (
            <g key={point.id}>
              {mismatch ? (
                <circle
                  cx={toSvgX(point.x, size, mapBounds.minX, mapBounds.maxX)}
                  cy={toSvgY(point.y, size, mapBounds.minY, mapBounds.maxY)}
                  r={10}
                  fill="none"
                  stroke="rgba(252,211,77,0.35)"
                  strokeWidth={2}
                  className="pulse-flow"
                />
              ) : null}
              <circle
                cx={toSvgX(point.x, size, mapBounds.minX, mapBounds.maxX)}
                cy={toSvgY(point.y, size, mapBounds.minY, mapBounds.maxY)}
                r={point.isSafe ? 5.5 : 4.8}
                fill={point.isSafe ? '#67e8f9' : '#f87171'}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={1.4}
              />
            </g>
          )
        })}
      </svg>
    )
  }
}
