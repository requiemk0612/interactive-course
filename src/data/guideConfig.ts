import type {
  GuideActionId,
  GuideMode,
  GuideStep,
  HelpTopic,
  LessonStageId,
  StageTaskStrip,
} from '../types'

type TaskStripArgs = {
  stageId: LessonStageId
  guideMode: GuideMode
  completedActions: GuideActionId[]
}

export const onboardingPanels = [
  {
    title: '这是什么模拟',
    body: '这是一个无人机二维落点安全决策模拟。你看到的是“一个坐标是否适合降落”的判断结构，不是完整飞行物理仿真。',
  },
  {
    title: '你将会做什么',
    body: '你会先测试一个没有隐藏层的网络，再看到隐藏单元和激活函数如何改变表达能力，最后亲手构造一个小型可用网络。',
  },
  {
    title: '如何操作',
    items: [
      '拖动地图上的探针点或边界线',
      '点击节点或连接查看它们的含义',
      '跟随高亮控件完成当前步骤',
    ],
  },
]

export const helpTopics: Record<LessonStageId, HelpTopic> = {
  challenge: {
    stageId: 'challenge',
    title: '你现在看到的是什么？',
    body: '左边是没有隐藏层的最简单网络，右边是无人机二维落点地图。你的任务是先做预测，再运行检验，看看一条直接决策规则能否分开安全区与不安全区。',
  },
  io: {
    stageId: 'io',
    title: '你现在看到的是什么？',
    body: '右侧地图上的探针点代表“当前被测试的落点”，左侧网络展示这个坐标如何进入输入层，再变成输出层的安全判断。',
  },
  hidden: {
    stageId: 'hidden',
    title: '你现在看到的是什么？',
    body: '网络中出现了四个隐藏单元。一次只看一个隐藏单元，观察它在地图上对应哪一条边界，以及它对哪一侧区域更敏感。',
  },
  activation: {
    stageId: 'activation',
    title: '你现在看到的是什么？',
    body: '这里要比较“关闭激活”和“开启激活”两种情况。重点不是层数变多，而是非线性激活是否让隐藏单元在不同区域表现出不同响应。',
  },
  build: {
    stageId: 'build',
    title: '你现在看到的是什么？',
    body: '这是一个构造式实验台。你将逐步放置四个边界检测器，再调整输出阈值，把多个简单中间响应组合成一个更完整的安全判断。',
  },
  trace: {
    stageId: 'trace',
    title: '你现在看到的是什么？',
    body: '这一页不要求你推公式，而是要求你先做预测，再测试局部变化会影响哪些后续部分。核心是看清“影响沿着前向方向传播”。',
  },
  summary: {
    stageId: 'summary',
    title: '你现在看到的是什么？',
    body: '这是本单元的收束页。你可以重播四个关键概念片段，把“直接规则失败 → 中间特征出现 → 激活带来表达力 → 最终判断形成”串起来看。',
  },
  practice: {
    stageId: 'practice',
    title: '你现在看到的是什么？',
    body: '这是课程结尾的巩固练习区。它沿用同一套地图、网络和反馈逻辑，用 5 道短题帮你确认核心概念是否已经真正站稳。',
  },
}

const stageSteps: Record<LessonStageId, GuideStep[]> = {
  challenge: [
    {
      id: 'challenge-predict-and-check',
      title: '先预测，再检验',
      requiredActionIds: ['challenge-prediction', 'challenge-run-check'],
      focusTarget: 'challenge-predictions',
      hint: '先选择你的预测，再点击“运行检验”。这一页最重要的是完成一次明确的预测—检验闭环。',
      completionToast: '你已经完成了“先预测，再检验”的关键闭环。',
    },
  ],
  io: [
    {
      id: 'io-move-probe',
      title: '拖动探针点',
      requiredActionIds: ['io-drag-probe'],
      focusTarget: 'probe-point',
      hint: '拖动发光探针点，观察 x、y 输入值和输出判断如何同步变化。',
      completionToast: '很好，你已经看到了“位置进入网络，再变成判断”的过程。',
    },
  ],
  hidden: [
    {
      id: 'hidden-h1',
      title: '先观察 H1',
      requiredActionIds: ['hidden-view-h1'],
      focusTarget: 'hidden-unit-h1',
      hint: '先点击 H1，看看这个隐藏单元在地图上对应哪一条边界、哪一侧区域更活跃。',
      completionToast: 'H1 已经检查完毕，现在可以去比较第二个隐藏单元。',
    },
    {
      id: 'hidden-h2',
      title: '再比较 H2',
      requiredActionIds: ['hidden-view-h2'],
      focusTarget: 'hidden-unit-h2',
      hint: '再点击 H2，并比较它与 H1 的响应区域有什么不同。',
      completionToast: '你已经比较了两个隐藏单元的中间响应。',
    },
  ],
  activation: [
    {
      id: 'activation-toggle',
      title: '切换激活开关',
      requiredActionIds: ['activation-toggle-once'],
      focusTarget: 'activation-toggle',
      hint: '切换“关闭激活 / 开启激活”，比较地图上的有效边界和区域响应怎样变化。',
      completionToast: '你已经看到：真正改变表达力的不是层数本身，而是非线性激活。',
      bridgeText: '到这里为止，只是增加单元数量仍然不够。',
    },
  ],
  build: [
    {
      id: 'build-1',
      title: '第一个边界检测器',
      requiredActionIds: ['build-boundary-1'],
      focusTarget: 'build-unit-h1',
      hint: '先拖动并旋转第一个边界检测器，让它贴近安全区的一条边界。',
      completionToast: '很好，第一个中间检测器已经开始承担局部边界判断。',
    },
    {
      id: 'build-2',
      title: '第二个边界检测器',
      requiredActionIds: ['build-boundary-2'],
      focusTarget: 'build-unit-h2',
      hint: '继续放置第二个边界检测器，让它从另一侧补足安全区的形状。',
      completionToast: '第二个中间检测器已经加入组合。',
    },
    {
      id: 'build-3',
      title: '第三个边界检测器',
      requiredActionIds: ['build-boundary-3'],
      focusTarget: 'build-unit-h3',
      hint: '继续拖动第三个边界检测器，让安全区的另一条边界更清晰。',
      completionToast: '第三个中间检测器已经就位。',
    },
    {
      id: 'build-4',
      title: '第四个边界检测器',
      requiredActionIds: ['build-boundary-4'],
      focusTarget: 'build-unit-h4',
      hint: '再放置第四个边界检测器，补足剩余边界，让安全区更完整。',
      completionToast: '四个中间检测器都已经参与组合。',
    },
    {
      id: 'build-5',
      title: '调整输出阈值',
      requiredActionIds: ['build-threshold'],
      focusTarget: 'build-threshold',
      hint: '最后调整输出阈值，让多个中间检测器共同形成稳定的安全判断。',
      completionToast: '你已经完成了从中间检测器到最终输出判断的组合。',
    },
  ],
  trace: [
    {
      id: 'trace-task-1',
      title: '预测新增隐藏单元的影响',
      requiredActionIds: ['trace-task-1'],
      focusTarget: 'trace-question-1',
      hint: '先回答“增加一个隐藏单元会影响哪些后续部分”，再点击“测试这个变化”。',
      completionToast: '第一个因果追踪任务已完成。',
    },
    {
      id: 'trace-task-2',
      title: '预测修改单条权重的影响',
      requiredActionIds: ['trace-task-2'],
      focusTarget: 'trace-question-2',
      hint: '再回答“修改一条输入到隐藏单元的权重会影响哪里”，然后拖动权重并应用变化。',
      completionToast: '第二个因果追踪任务已完成。',
    },
  ],
  summary: [
    {
      id: 'summary-replay',
      title: '重播核心故事',
      requiredActionIds: ['summary-replay'],
      focusTarget: 'summary-replay',
      hint: '点击下方任意一个“重播故事”卡片，重新串起这一单元的四个关键概念。',
      completionToast: '你已经完成了对整节课核心叙事的回顾。',
    },
  ],
  practice: [],
}

const stageBaseTaskStrips: Record<LessonStageId, StageTaskStrip> = {
  challenge: {
    showing: '一个没有隐藏层的直接模型，以及它在二维落点平面上的单一直线边界。',
    goal: '判断这条直接规则是否足以分开安全区与不安全区。',
    action: '先选一个预测，再拖动边界或调整权重，最后点击“运行检验”。',
  },
  io: {
    showing: '一个位置如何同时映射到输入节点、输出分数和安全判断。',
    goal: '看清“输入值变化”与“模型结构变化”不是一回事。',
    action: '拖动发光探针点到不同位置，观察输入节点和输出节点同步更新。',
  },
  hidden: {
    showing: '隐藏单元如何在地图上对应更简单的边界检测与区域响应。',
    goal: '理解单个隐藏单元只是一个中间检测器，而不是完整答案。',
    action: '一次点击一个隐藏单元，先看 H1，再看 H2，再比较它们的响应区域。',
  },
  activation: {
    showing: '同一组隐藏单元在“关闭激活”和“开启激活”时的不同表现。',
    goal: '看清真正改变表达力的是非线性激活，而不只是层数增加。',
    action: '切换激活开关，比较右侧边界和响应区域怎样变化。',
  },
  build: {
    showing: '一个构造式实验台，你可以逐步摆放边界检测器并组合输出判断。',
    goal: '把几个简单中间检测器组合成一个更完整的安全降落判断。',
    action: '跟随当前高亮检测器，拖动、旋转并选择响应方向，再调整输出阈值。',
  },
  trace: {
    showing: '局部结构变化如何沿着前向方向影响后续隐藏响应和输出。',
    goal: '先预测，再测试“影响会传播到哪里”。',
    action: '先回答问题，再点击“测试这个变化”或“应用变化”。',
  },
  summary: {
    showing: '本单元的完整概念闭环与一个克制的探索画像。',
    goal: '把四个关键概念重新串起来，形成稳定回忆。',
    action: '点击“重播故事”中的任意一项，回顾你最想再看一遍的概念。',
  },
  practice: {
    showing: '课程结尾的练习测试模块，仍然使用同样的网络与地图语言来检验核心理解。',
    goal: '用 5 道低压力短题确认：单层网络的局限、结构角色分工、激活函数作用和简单构造思路是否已经清楚。',
    action: '先看题目与提示，再作答，然后点击“提交本题”。答完后可继续下一题，也可重新作答。',
  },
}

export const summaryReplayItems = [
  { id: 'one-line-fails', label: '一个直接规则不够' },
  { id: 'input-output-roles', label: '输入和输出角色不同' },
  { id: 'hidden-detectors', label: '隐藏单元构造中间检测器' },
  { id: 'activation-expressive', label: '激活让它们真正有表达力' },
]

export function getGuideSteps(stageId: LessonStageId) {
  return stageSteps[stageId]
}

export function getStageProgress(stageId: LessonStageId, completedActions: GuideActionId[]) {
  const steps = stageSteps[stageId]
  const completedStepCount = steps.filter((step) =>
    step.requiredActionIds.every((actionId) => completedActions.includes(actionId)),
  ).length

  return {
    total: steps.length,
    completed: completedStepCount,
    currentStepIndex: Math.min(completedStepCount, Math.max(steps.length - 1, 0)),
  }
}

export function getActiveGuideStep(
  stageId: LessonStageId,
  completedActions: GuideActionId[],
) {
  const steps = stageSteps[stageId]
  return (
    steps.find((step) =>
      step.requiredActionIds.some((actionId) => !completedActions.includes(actionId)),
    ) ?? steps[steps.length - 1]
  )
}

export function isStageComplete(
  stageId: LessonStageId,
  completedActions: GuideActionId[],
) {
  return stageSteps[stageId].every((step) =>
    step.requiredActionIds.every((actionId) => completedActions.includes(actionId)),
  )
}

export function getTaskStrip({
  stageId,
  guideMode,
  completedActions,
}: TaskStripArgs): StageTaskStrip {
  const base = stageBaseTaskStrips[stageId]

  if (guideMode === 'free') {
    return base
  }

  const activeStep = getActiveGuideStep(stageId, completedActions)

  if (!activeStep) {
    return base
  }

  if (stageId === 'build') {
    return {
      showing: base.showing,
      goal: `完成当前引导步骤：${activeStep.title}。`,
      action: activeStep.hint,
    }
  }

  if (stageId === 'trace') {
    return {
      showing: base.showing,
      goal: `完成当前预测任务：${activeStep.title}。`,
      action: activeStep.hint,
    }
  }

  return {
    showing: base.showing,
    goal: activeStep.title,
    action: activeStep.hint,
  }
}
