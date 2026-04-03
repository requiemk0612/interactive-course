import type { GuideMode, GuideStep } from '../types'
import { HintBubble } from './HintBubble'

type GuideManagerProps = {
  guideMode: GuideMode
  step: GuideStep | undefined
}

export function GuideManager({
  guideMode,
  step,
}: GuideManagerProps) {
  if (guideMode !== 'guided' || !step) {
    return null
  }

  return (
    <HintBubble tone="strong">
      <div className="text-xs tracking-[0.18em] text-cyan-100/70">当前引导</div>
      <div className="mt-2 font-display text-base text-slate-100">{step.title}</div>
      <div className="mt-1 text-sm leading-7 text-cyan-50/90">{step.hint}</div>
    </HintBubble>
  )
}
