import clsx from 'clsx'
import type { LessonStageId, LessonStageMeta } from '../types'

type ChapterRailProps = {
  stages: LessonStageMeta[]
  currentStageId: LessonStageId
  onSelectStage: (stageId: LessonStageId) => void
}

export function ChapterRail({
  stages,
  currentStageId,
  onSelectStage,
}: ChapterRailProps) {
  return (
    <div className="glass-panel glow-ring sticky top-24 rounded-[28px] p-4">
      <div className="mb-4 rounded-2xl border border-slate-700/50 bg-white/5 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
          本单元学习环节
        </p>
        <p className="mt-2 text-sm text-slate-300">
          7 个连续教学环节，构成一个完整学习闭环。
        </p>
      </div>
      <nav aria-label="本单元学习环节" className="space-y-2">
        {stages.map((stage) => {
          const isActive = stage.id === currentStageId
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => onSelectStage(stage.id)}
              className={clsx(
                'w-full rounded-2xl border px-4 py-3 text-left transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300',
                isActive
                  ? 'border-sky-300/60 bg-sky-300/15 text-white shadow-[0_0_24px_rgba(96,165,250,0.22)]'
                  : 'border-slate-700/60 bg-slate-900/55 text-slate-300 hover:border-slate-500 hover:bg-slate-800/70',
              )}
              aria-current={isActive ? 'step' : undefined}
            >
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                {stage.stepNumber.toString().padStart(2, '0')}
              </div>
              <div className="mt-1 font-display text-[15px] tracking-wide">
                {stage.titleZh}
              </div>
              <div className="mt-1 text-xs text-slate-400">{stage.titleEn}</div>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
