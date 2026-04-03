import clsx from 'clsx'
import type { ConceptCard, LessonStageMeta, UnderstandingProfile } from '../types'

type ConceptPanelProps = {
  stage: LessonStageMeta
  cards: ConceptCard[]
  understandingProfile: UnderstandingProfile
}

export function ConceptPanel({
  stage,
  cards,
  understandingProfile,
}: ConceptPanelProps) {
  return (
    <aside className="glass-panel soft-scrollbar flex max-h-[calc(100vh-13rem)] flex-col overflow-y-auto rounded-[28px] border border-white/8">
      <div className="border-b border-white/8 px-5 py-5">
        <div className="rounded-[22px] border border-cyan-300/15 bg-cyan-300/[0.08] px-4 py-3 text-sm leading-7 text-slate-200/90">
          这是本单元第 {stage.stepNumber} 个教学环节。
        </div>
      </div>

      <div className="space-y-4 p-5">
        {cards.map((card) => (
          <div
            key={card.title}
            className={clsx(
              'rounded-[24px] border px-4 py-4 shadow-[inset_0_0_24px_rgba(148,163,184,0.03)]',
              card.tone === 'warning' &&
                'border-amber-300/18 bg-amber-300/[0.09] text-amber-50/95',
              card.tone === 'success' &&
                'border-emerald-300/18 bg-emerald-300/[0.09] text-emerald-50/95',
              (!card.tone || card.tone === 'info') &&
                'border-white/8 bg-white/[0.035] text-slate-100/90',
            )}
          >
            <h3 className="font-display text-base tracking-[0.03em]">{card.title}</h3>
            <p className="mt-2 text-sm leading-7 text-inherit/90">{card.body}</p>
          </div>
        ))}

        {stage.id === 'summary' ? (
          <div className="rounded-[24px] border border-white/8 bg-white/[0.035] px-4 py-4">
            <h3 className="font-display text-base tracking-[0.03em] text-slate-100">
              探索画像
            </h3>
            <p className="mt-2 text-xs leading-6 text-slate-400">
              这是根据你在本课中的探索形成的粗略回顾，不是正式评分。
            </p>
            <div className="mt-4 space-y-4">
              {understandingProfile.map((item) => (
                <div key={item.key}>
                  <div className="flex items-center justify-between gap-3 text-sm text-slate-200/90">
                    <span>{item.label}</span>
                    <span className="font-mono text-xs text-slate-400">
                      {item.value === null ? '未形成足够观察' : `${Math.round(item.value * 100)}%`}
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-800/90">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-sky-300 via-cyan-300 to-emerald-300 transition-all duration-500"
                      style={{ width: `${(item.value ?? 0) * 100}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs leading-6 text-slate-400">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  )
}
