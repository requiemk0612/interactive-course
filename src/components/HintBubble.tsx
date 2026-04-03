import clsx from 'clsx'
import type { ReactNode } from 'react'

type HintBubbleProps = {
  children: ReactNode
  className?: string
  tone?: 'info' | 'strong'
}

export function HintBubble({
  children,
  className,
  tone = 'info',
}: HintBubbleProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl border px-4 py-3 text-sm leading-7 shadow-[0_18px_40px_rgba(2,8,23,0.35)] backdrop-blur-xl',
        tone === 'strong'
          ? 'border-cyan-300/25 bg-[rgba(14,35,53,0.85)] text-cyan-50'
          : 'border-white/10 bg-[rgba(12,18,32,0.78)] text-slate-200/90',
        className,
      )}
    >
      {children}
    </div>
  )
}
