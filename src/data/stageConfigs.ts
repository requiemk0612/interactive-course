import type { ConceptCard, UnderstandingProfile } from '../types'
import type { EngagementState, LessonStageId } from '../types'

type ConceptCardArgs = {
  stageId: LessonStageId
  teacherMode: boolean
  challengeChecked: boolean
  challengePrediction: string | null
  activationMode: 'off' | 'relu'
  buildScore: number
  traceApplied: boolean
}

export function getConceptCards({
  stageId,
  teacherMode,
  challengeChecked,
  challengePrediction,
  activationMode,
  buildScore,
  traceApplied,
}: ConceptCardArgs): ConceptCard[] {
  switch (stageId) {
    case 'challenge':
      return [
        {
          title: '这是本单元第 1 个教学环节',
          body: '我们先验证一个直接模型是否足够。若只有输入层和输出层，模型只能形成一条线性的决策边界。',
        },
        {
          title: '反馈',
          body: challengeChecked
            ? '在这个二维任务中，没有隐藏层的网络只能画出一条线性的决策边界，这对于当前安全降落区来说仍然过于受限。'
            : '先选择你对“一条直线是否足够”的判断，再运行检查。误分类点会帮助你看清直接模型的限制。',
          tone: challengePrediction === 'no' ? 'success' : 'warning',
        },
        ...(teacherMode
          ? [
              {
                title: '教师模式',
                body: '教师模式会展示更正式的表达：输出来自一个对 x、y 的仿射组合，再经过阈值判断。',
              },
            ]
          : []),
      ]
    case 'io':
      return [
        {
          title: '输入层（Input layer）',
          body: '输入层保存当前样本的描述信息。在本作品里，它只承载无人机候选落点的 x、y 坐标。',
        },
        {
          title: '输出层（Output layer）',
          body: '输出层把内部计算结果转成最终判断，告诉我们当前位置是“可安全降落”还是“不安全”。',
        },
      ]
    case 'hidden':
      return [
        {
          title: '这是本单元第 3 个教学环节',
          body: '单个隐藏单元并不负责整个决策，它更像一个中间检测器，用来表示某个更简单的模式或条件。多个隐藏单元组合起来，才能为网络提供更丰富的构件。',
        },
        ...(teacherMode
          ? [
              {
                title: '教师模式',
                body: '此时可以观察被选隐藏单元的权重、偏置、预激活值与激活值之间的关系。',
              },
            ]
          : []),
      ]
    case 'activation':
      return [
        {
          title: '没有激活函数',
          body: '如果每一层都只是线性变换，那么多层相乘仍可折叠成一个整体线性映射，表现仍像一条全局直线。',
          tone: activationMode === 'off' ? 'warning' : 'info',
        },
        {
          title: '有激活函数',
          body: '加入非线性激活后，每个隐藏单元能在不同区域做出不同响应，成为更有表达力的区域敏感构件（region-sensitive building block）。',
          tone: activationMode === 'relu' ? 'success' : 'info',
        },
      ]
    case 'build':
      return [
        {
          title: '持续提醒',
          body: '这里不是让某一个单元独自解决整个问题，而是在构造几个简单的中间响应，再让输出层把它们组合起来。',
        },
        {
          title: '当前构造效果',
          body:
            buildScore > 0.84
              ? '这组隐藏单元已经能较好地围出安全落地区域。你可以继续拖动探针点，观察输入、隐藏响应与输出如何联动。'
              : '继续调整四条边界的角度、偏移和响应方向。目标是让区域内部的点尽量同时激活多个中间检测器。',
          tone: buildScore > 0.84 ? 'success' : 'warning',
        },
      ]
    case 'trace':
      return [
        {
          title: '方向性依赖',
          body: '信息在前向计算中由输入流向隐藏层，再流向输出层。后面的修改不会倒过来改写前面的原始输入值。',
        },
        {
          title: '注意',
          body:
            '有时节点显示出来的值保持不变，但底层的预激活值其实已经改变。例如 ReLU 在负区间内可能一直显示为 0，即使预激活值并不相同。',
          tone: traceApplied ? 'success' : 'info',
        },
      ]
    case 'summary':
      return [
        {
          title: '理解画像',
          body: '这些指标只基于你在本单元里的真实交互痕迹生成，用于帮助回顾，不代表精确测量。',
        },
        {
          title: '最终 takeaway',
          body: '神经网络表达力的增强，不是简单地多加几个节点，而是通过构造有意义的中间响应，并用非线性激活把它们转成更丰富的决策结构。',
          tone: 'success',
        },
      ]
  }
}

export function getUnderstandingProfile(
  engagement: EngagementState,
): UnderstandingProfile {
  return [
    {
      key: 'linear',
      label: '线性与非线性直觉',
      value:
        engagement.challengeInsight === null
          ? null
          : engagement.challengeInsight
            ? 0.84
            : 0.42,
      note:
        engagement.challengeInsight === null
          ? '尚未形成足够观察'
          : '是否意识到单一直线不足以描述安全区',
    },
    {
      key: 'io',
      label: '输入输出映射理解',
      value: engagement.movedProbe ? 0.86 : null,
      note: engagement.movedProbe
        ? '已通过拖动 probe point 观察输入到输出的联动'
        : '尚未形成足够观察',
    },
    {
      key: 'hidden',
      label: '隐藏特征理解',
      value: engagement.openedHiddenUnits.length >= 2 ? 0.8 : null,
      note:
        engagement.openedHiddenUnits.length >= 2
          ? '已对多个隐藏单元的中间几何测试进行比较'
          : '尚未形成足够观察',
    },
    {
      key: 'activation',
      label: '激活作用理解',
      value:
        engagement.comparedActivationModes && engagement.completedTrace ? 0.88 : null,
      note:
        engagement.comparedActivationModes && engagement.completedTrace
          ? '已比较激活开关，并追踪局部修改对后续计算的影响'
          : '尚未形成足够观察',
    },
  ]
}
