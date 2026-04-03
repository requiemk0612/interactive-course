import type { GuideMode, StageTaskStrip } from '../types'

type CurrentTaskStripProps = {
  task: StageTaskStrip
  guideMode: GuideMode
  stepLabel?: string | null
}

export function CurrentTaskStrip({
  task,
  guideMode,
  stepLabel,
}: CurrentTaskStripProps) {
  return (
    <div className="task-strip rounded-[26px] px-5 py-4">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-cyan-300/22 bg-cyan-300/10 px-3 py-1 text-[11px] tracking-[0.18em] text-cyan-100/80">
          当前任务条
        </span>
        <span className="text-xs tracking-[0.14em] text-slate-400">
          {guideMode === 'guided' ? '引导模式' : '自由探索'}
        </span>
        {stepLabel ? (
          <span className="rounded-full border border-white/8 bg-black/20 px-3 py-1 text-xs text-slate-300/90">
            {stepLabel}
          </span>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div>
          <div className="text-xs tracking-[0.16em] text-slate-400">这一页在展示什么</div>
          <p className="mt-2 text-sm leading-7 text-slate-200/90">{task.showing}</p>
        </div>
        <div>
          <div className="text-xs tracking-[0.16em] text-slate-400">你现在的目标</div>
          <p className="mt-2 text-sm leading-7 text-slate-200/90">{task.goal}</p>
        </div>
        <div>
          <div className="text-xs tracking-[0.16em] text-slate-400">建议先做什么</div>
          <p className="mt-2 text-sm leading-7 text-slate-200/90">{task.action}</p>
        </div>
      </div>
    </div>
  )
}
