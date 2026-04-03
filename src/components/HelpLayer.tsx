import type { HelpTopic } from '../types'

type HelpLayerProps = {
  open: boolean
  topic: HelpTopic
  onClose: () => void
}

export function HelpLayer({
  open,
  topic,
  onClose,
}: HelpLayerProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-[rgba(2,6,23,0.76)] px-4 backdrop-blur-xl">
      <div className="w-full max-w-2xl rounded-[34px] border border-white/10 bg-[rgba(8,14,26,0.96)] px-6 py-6 shadow-[0_36px_100px_rgba(0,0,0,0.48)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs tracking-[0.24em] text-cyan-100/70">上下文帮助</div>
            <h3 className="mt-2 font-display text-2xl tracking-[0.03em] text-slate-100">
              {topic.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/8 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-500"
          >
            关闭
          </button>
        </div>
        <p className="mt-5 text-sm leading-8 text-slate-300/90">{topic.body}</p>
      </div>
    </div>
  )
}
