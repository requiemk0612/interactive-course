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
    <aside className="glass-panel soft-scrollbar flex max-h-[calc(100vh-13rem)] flex-col overflow-y-auto rounded-[28px] border border-slate-700/70">
      <div className="border-b border-slate-700/70 px-5 py-5">
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/8 px-4 py-3 text-sm text-slate-200">
          这是本单元第 {stage.stepNumber} 个教学环节
        </div>
      </div>

      <div className="space-y-4 p-5">
        {cards.map((card) => (
          <div
            key={card.title}
            className={clsx(
              'rounded-2xl border px-4 py-4',
              card.tone === 'warning' &&
                'border-amber-300/25 bg-amber-300/10 text-amber-100',
              card.tone === 'success' &&
                'border-mint-300/25 bg-mint-300/10 text-mint-100',
              (!card.tone || card.tone === 'info') &&
                'border-slate-700/70 bg-slate-900/60 text-slate-100',
            )}
          >
            <h3 className="font-display text-base tracking-wide">{card.title}</h3>
            <p className="mt-2 text-sm leading-6 text-inherit/90">{card.body}</p>
          </div>
        ))}

        {stage.id === 'summary' ? (
          <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 px-4 py-4">
            <h3 className="font-display text-base tracking-wide text-slate-100">
              理解画像
            </h3>
            <div className="mt-4 space-y-4">
              {understandingProfile.map((item) => (
                <div key={item.key}>
                  <div className="flex items-center justify-between gap-3 text-sm text-slate-200">
                    <span>{item.label}</span>
                    <span className="text-xs text-slate-400">
                      {item.value === null
                        ? '未形成足够观察'
                        : `${Math.round(item.value * 100)}%`}
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-sky-300 via-cyan-300 to-mint-300 transition-all duration-500"
                      style={{ width: `${(item.value ?? 0) * 100}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  )
}
