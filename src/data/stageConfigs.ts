import type { ConceptCard, EngagementState, LessonStageId, UnderstandingProfile } from '../types'

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
          title: '当前提醒',
          body: '你现在是在测试“没有隐藏层的直接模型”能做到什么，而不是马上找一个完美答案。失败本身就是这一步最重要的信息。',
          tone: 'warning',
        },
        {
          title: '概念反馈',
          body: challengeChecked
            ? '你刚才移动的是一条直接决策规则。无论它怎样在平面上平移或旋转，都仍然只是一个线性边界，无法完整包住当前安全区。'
            : '先做一个预测，再点击“运行检验”。看到误分类点之后，你会更容易理解为什么单一线性规则在这里不够用。',
          tone: challengeChecked
            ? challengePrediction === 'no'
              ? 'success'
              : 'warning'
            : 'info',
        },
        ...(teacherMode
          ? [
              {
                title: '教师模式提示',
                body: '此时输出来自对 x、y 的一次仿射组合，再经过阈值判断。这个结构本质上只能形成一条线性决策边界。',
              },
            ]
          : []),
      ]
    case 'io':
      return [
        {
          title: '输入层（Input layer）',
          body: '输入层只保存当前样本的描述信息。在本课里，它只是把候选落点的 x、y 坐标送进网络。',
        },
        {
          title: '输出层（Output layer）',
          body: '输出层把网络内部的计算结果汇总成最终判断，告诉我们当前坐标是“可安全降落”还是“不安全”。',
        },
        {
          title: '澄清提示',
          body: '你现在改变的是被测试的位置，而不是模型本身。网络参数并没有在这一页被修改。',
          tone: 'warning',
        },
      ]
    case 'hidden':
      return [
        {
          title: '这一页在做什么',
          body: '一个隐藏单元不是整个解决方案，它更像一个中间检测器。它负责对某一类更简单的几何条件做出响应。',
        },
        {
          title: '组合意义',
          body: '多个隐藏单元一起工作时，网络就不必直接从原始输入跳到最终答案，而是先搭出一组可组合的中间特征。',
        },
        ...(teacherMode
          ? [
              {
                title: '教师模式提示',
                body: '点击不同隐藏单元后，可以对比它们的权重、偏置、预激活值与激活值，理解它们各自检测的是哪一侧区域。',
              },
            ]
          : []),
      ]
    case 'activation':
      return [
        {
          title: '关闭激活时',
          body: '如果每一层都只是线性变换，多层堆叠仍可以等价成一个整体线性规则。模型看起来变复杂了，但表达能力并没有本质改变。',
          tone: activationMode === 'off' ? 'warning' : 'info',
        },
        {
          title: '开启激活时',
          body: '加入非线性激活后，隐藏单元可以在不同区域做出不同响应，真正成为有表达力的中间构件。',
          tone: activationMode === 'relu' ? 'success' : 'info',
        },
      ]
    case 'build':
      return [
        {
          title: '构造原则',
          body: '你不是在教某一个单元独自解决整个问题，而是在摆放几个简单的中间检测器，再让输出层把它们组合起来。',
        },
        {
          title: '当前效果',
          body:
            buildScore > 0.84
              ? '当前这组检测器已经比较接近目标结构。继续拖动探针点，可以观察输入、隐藏响应和输出判断如何联动。'
              : '继续拖动、旋转并选择响应方向。每一次局部调整，都会改变哪些点被判为安全，哪些点还会被错分。',
          tone: buildScore > 0.84 ? 'success' : 'warning',
        },
      ]
    case 'trace':
      return [
        {
          title: '方向依赖',
          body: '前向计算的信息流总是从输入层流向隐藏层，再流向输出层。后面的改动不会反过来改写前面的输入值。',
        },
        {
          title: '容易混淆的地方',
          body:
            '有时节点显示出来的值看起来没有变化，但底层的预激活值其实已经变了。例如 ReLU 在负区间内可能一直显示为 0，即使预激活值并不相同。',
          tone: traceApplied ? 'success' : 'info',
        },
      ]
    case 'summary':
      return [
        {
          title: '这一页的作用',
          body: '这里不是新的知识点，而是把整节课的叙事重新收束成一个清晰闭环，帮助你把各个环节连起来看。',
        },
        {
          title: '最终 takeaway',
          body: '神经网络表达力的提升，不是因为“多几个点”本身，而是因为隐藏单元先构造了中间特征，激活函数再让这些特征在不同区域产生真正有区别的响应。',
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
          ? '还没有形成足够观察'
          : '是否意识到单一直接规则无法完整描述安全区',
    },
    {
      key: 'io',
      label: '输入与输出角色',
      value: engagement.movedProbe ? 0.86 : null,
      note: engagement.movedProbe
        ? '已经通过拖动探针点观察“位置进入网络，再变成判断”的过程'
        : '还没有形成足够观察',
    },
    {
      key: 'hidden',
      label: '隐藏特征理解',
      value: engagement.openedHiddenUnits.length >= 2 ? 0.8 : null,
      note:
        engagement.openedHiddenUnits.length >= 2
          ? '已经比较过多个隐藏单元对应的中间几何检测'
          : '还没有形成足够观察',
    },
    {
      key: 'activation',
      label: '激活作用理解',
      value:
        engagement.comparedActivationModes && engagement.completedTrace ? 0.88 : null,
      note:
        engagement.comparedActivationModes && engagement.completedTrace
          ? '已经比较激活开关，并追踪局部变化对后续计算的影响'
          : '还没有形成足够观察',
    },
  ]
}
