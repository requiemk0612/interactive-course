import type { InspectorState } from '../types'

type InspectorPopoverProps = {
  inspector: InspectorState | null
  onClose: () => void
}

export function InspectorPopover({
  inspector,
  onClose,
}: InspectorPopoverProps) {
  if (!inspector) {
    return null
  }

  return (
    <div
      className="pointer-events-auto absolute z-30 w-72 rounded-[24px] border border-cyan-300/18 bg-[rgba(8,14,25,0.92)] p-4 shadow-[0_24px_60px_rgba(2,8,23,0.58)] backdrop-blur-xl"
      style={{
        left: `calc(${inspector.x}% - 144px)`,
        top: `calc(${inspector.y}% - 10px)`,
      }}
      role="dialog"
      aria-label={inspector.title}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-sm tracking-[0.12em] text-slate-100">
            {inspector.title}
          </h3>
          {inspector.subtitle ? (
            <p className="mt-1 text-xs text-slate-400">{inspector.subtitle}</p>
          ) : null}
        </div>
        <button
          type="button"
          className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300 transition hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          onClick={onClose}
        >
          关闭
        </button>
      </div>

      <div className="mt-3 space-y-2 rounded-[18px] border border-white/8 bg-black/20 p-3">
        {inspector.lines.map((line) => (
          <div key={line.label} className="flex items-center justify-between gap-4 text-sm">
            <span className="text-slate-400">{line.label}</span>
            <span className="font-mono tabular-nums text-slate-100">{line.value}</span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs leading-6 text-slate-300/90">{inspector.interpretation}</p>
    </div>
  )
}
