import clsx from 'clsx'
import type { GuideMode, LessonStageId, LessonStageMeta } from '../types'

type ChapterRailProps = {
  stages: LessonStageMeta[]
  currentStageId: LessonStageId
  guideMode: GuideMode
  unlockedStageIds: LessonStageId[]
  onSelectStage: (stageId: LessonStageId) => void
}

export function ChapterRail({
  stages,
  currentStageId,
  guideMode,
  unlockedStageIds,
  onSelectStage,
}: ChapterRailProps) {
  return (
    <div className="glass-panel glow-ring sticky top-24 rounded-[30px] p-4">
      <div className="mb-4 rounded-[24px] border border-white/8 bg-white/[0.04] px-4 py-4">
        <p className="text-xs tracking-[0.24em] text-slate-400">本单元学习环节</p>
        <p className="mt-2 text-sm leading-7 text-slate-300/90">
          7 个连续教学环节构成一个完整学习闭环。
        </p>
      </div>

      <nav aria-label="本单元学习环节" className="space-y-3">
        {stages.map((stage) => {
          const isActive = stage.id === currentStageId
          const locked = guideMode === 'guided' && !unlockedStageIds.includes(stage.id)

          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => onSelectStage(stage.id)}
              disabled={locked}
              className={clsx(
                'hex-rail-item relative w-full px-4 py-3 text-left transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300',
                isActive
                  ? 'border-sky-300/50 bg-sky-300/14 text-slate-100 shadow-[0_0_28px_rgba(96,165,250,0.18)]'
                  : 'border-white/8 bg-white/[0.03] text-slate-200/80 hover:border-slate-500 hover:bg-white/[0.05]',
                locked && 'cursor-not-allowed opacity-45 saturate-75',
              )}
              aria-current={isActive ? 'step' : undefined}
            >
              <div className="flex items-start gap-3">
                <div
                  className={clsx(
                    'rounded-[16px] border px-3 py-2 text-[11px] tracking-[0.22em]',
                    isActive
                      ? 'border-sky-300/40 bg-sky-300/12 text-sky-50'
                      : 'border-white/8 bg-black/15 text-slate-400',
                  )}
                >
                  {stage.stepNumber.toString().padStart(2, '0')}
                </div>
                <div className="min-w-0">
                  <div className="font-display text-[15px] tracking-[0.03em] text-inherit">
                    {stage.titleZh}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{stage.titleEn}</div>
                </div>
              </div>
              {isActive ? (
                <div className="absolute right-0 top-1/2 h-px w-8 -translate-y-1/2 bg-gradient-to-r from-sky-300/70 to-transparent" />
              ) : null}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
