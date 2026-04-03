type OnboardingBriefingProps = {
  open: boolean
  panels: Array<{
    title: string
    body?: string
    items?: string[]
  }>
  onStartGuided: () => void
  onStartFree: () => void
}

export function OnboardingBriefing({
  open,
  panels,
  onStartGuided,
  onStartFree,
}: OnboardingBriefingProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(2,6,23,0.8)] px-4 backdrop-blur-xl">
      <div className="w-full max-w-6xl rounded-[36px] border border-cyan-300/18 bg-[linear-gradient(180deg,rgba(10,18,34,0.96),rgba(6,12,24,0.98))] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.45)] lg:p-8">
        <div className="max-w-3xl">
          <div className="text-xs tracking-[0.26em] text-cyan-100/70">任务简报</div>
          <h2 className="mt-3 font-display text-3xl tracking-[0.04em] text-slate-100">
            先用一分钟，知道你将如何进入这节交互课
          </h2>
          <p className="mt-4 text-sm leading-8 text-slate-300/90">
            你将进入一个围绕“无人机二维落点是否安全”的决策模拟。这里讲的是神经网络如何形成判断结构，不是飞行动力学仿真。
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {panels.map((panel) => (
            <section
              key={panel.title}
              className="rounded-[28px] border border-white/8 bg-white/[0.04] px-5 py-5 shadow-[inset_0_0_30px_rgba(148,163,184,0.05)]"
            >
              <h3 className="font-display text-lg text-slate-100">{panel.title}</h3>
              {panel.body ? (
                <p className="mt-3 text-sm leading-7 text-slate-300/90">{panel.body}</p>
              ) : null}
              {panel.items ? (
                <div className="mt-4 space-y-3">
                  {panel.items.map((item, index) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-2xl bg-black/20 px-3 py-3"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-xs text-cyan-100">
                        {index + 1}
                      </span>
                      <span className="text-sm leading-7 text-slate-300/90">{item}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onStartFree}
            className="rounded-full border border-slate-700 bg-white/[0.04] px-5 py-3 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-white/[0.08]"
          >
            自由探索
          </button>
          <button
            type="button"
            onClick={onStartGuided}
            className="primary-action rounded-full px-6 py-3 text-sm text-slate-950"
          >
            开始引导模式
          </button>
        </div>
      </div>
    </div>
  )
}
