type FeedbackToastProps = {
  message: string | null
  onClose: () => void
}

export function FeedbackToast({
  message,
  onClose,
}: FeedbackToastProps) {
  if (!message) {
    return null
  }

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[70] max-w-md">
      <div className="pointer-events-auto rounded-[24px] border border-cyan-300/16 bg-[rgba(9,17,31,0.88)] px-5 py-4 shadow-[0_28px_80px_rgba(0,0,0,0.42)] backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.55)]" />
          <div className="flex-1">
            <div className="text-sm leading-7 text-slate-200/90">{message}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/8 px-2 py-1 text-xs text-slate-300 transition hover:border-slate-500"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
