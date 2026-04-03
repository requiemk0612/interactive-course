import type { LessonStageMeta } from '../types'

export const stageList: LessonStageMeta[] = [
  {
    id: 'challenge',
    stepNumber: 1,
    titleEn: 'The Challenge',
    titleZh: '问题提出',
    shortHint: '先预测，再检验单一直接规则是否足够。',
    headline: '一条直接决策规则，真的能把这些点分开吗？',
    description:
      '这里的任务不是模拟无人机飞行动力学，而是做一个二维落点安全判断。先从最简单的网络开始：只有输入层和输出层，没有隐藏层。',
  },
  {
    id: 'io',
    stepNumber: 2,
    titleEn: 'Inputs and Outputs',
    titleZh: '输入与输出',
    shortHint: '观察一个位置如何被网络读入，再变成最终判断。',
    headline: '输入描述位置，输出给出判断。',
    description:
      '输入层只负责把当前落点的坐标送进网络，输出层只负责汇总计算结果并给出“可安全降落”或“不安全”的结论。',
  },
  {
    id: 'hidden',
    stepNumber: 3,
    titleEn: 'Hidden Units',
    titleZh: '隐藏单元',
    shortHint: '一次只看一个隐藏单元对应的中间几何检测。',
    headline: '隐藏单元先构造中间特征，再为最终决策提供积木。',
    description:
      '复杂的安全区不必一次性直接解决。网络可以先让不同隐藏单元分别表示更简单的边界检测，再把这些中间响应组合起来。',
  },
  {
    id: 'activation',
    stepNumber: 4,
    titleEn: 'Activation',
    titleZh: '激活作用',
    shortHint: '对比激活关闭与开启后的边界表达差异。',
    headline: '真正带来表达力提升的，不只是多一层，而是非线性激活。',
    description:
      '如果每一层都只是线性变换，多层堆叠仍然可以折叠成一个整体线性规则。激活函数让隐藏单元在不同区域表现出不同响应。',
  },
  {
    id: 'build',
    stepNumber: 5,
    titleEn: 'Build the Network',
    titleZh: '构造网络',
    shortHint: '逐步放置四个边界检测器，再调整输出阈值。',
    headline: '先构造几个简单检测器，再把它们组合成完整降落判断。',
    description:
      '这不是一个训练器，而是一个可操作的构造实验台。你将亲手摆放四个中间检测器，观察它们如何共同围出安全降落区域。',
  },
  {
    id: 'trace',
    stepNumber: 6,
    titleEn: 'Trace a Change',
    titleZh: '追踪变化',
    shortHint: '先预测，再测试一个局部修改会影响哪些后续部分。',
    headline: '网络能工作之后，再来观察局部改动如何沿着前向计算传播。',
    description:
      '这一页不讲训练，只讲方向依赖。后面的改动不会反过来改变输入，但会影响它之后的隐藏响应和输出判断。',
  },
  {
    id: 'summary',
    stepNumber: 7,
    titleEn: 'What You Learned',
    titleZh: '学习总结',
    shortHint: '回顾完整叙事闭环，并重播关键概念。',
    headline: '为什么隐藏层和激活函数如此重要？',
    description:
      '神经网络的表达力增强，并不是简单地多加几个节点，而是通过构造有意义的中间响应，并用非线性激活把这些响应转成更丰富的决策结构。',
  },
]
