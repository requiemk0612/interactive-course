type MissionProgressProps = {
  stageIndex: number
  stageTotal: number
  stepCompleted?: number
  stepTotal?: number
}

export function MissionProgress({
  stageIndex,
  stageTotal,
  stepCompleted,
  stepTotal,
}: MissionProgressProps) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.04] px-4 py-3 shadow-[inset_0_0_18px_rgba(103,232,249,0.05)]">
      <div className="text-xs tracking-[0.16em] text-slate-400">本单元进度</div>
      <div className="mt-3 flex items-center gap-2">
        {Array.from({ length: stageTotal }).map((_, index) => {
          const active = index <= stageIndex
          return (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition ${
                active
                  ? 'bg-gradient-to-r from-sky-300 to-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.25)]'
                  : 'bg-slate-800'
              }`}
            />
          )
        })}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-300">
        <span>
          第 {stageIndex + 1} / {stageTotal} 个教学环节
        </span>
        {typeof stepCompleted === 'number' && typeof stepTotal === 'number' && stepTotal > 0 ? (
          <span>
            页内步骤 {Math.min(stepCompleted + 1, stepTotal)} / {stepTotal}
          </span>
        ) : null}
      </div>
    </div>
  )
}
