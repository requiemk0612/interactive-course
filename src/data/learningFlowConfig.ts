import type { LessonStageMeta } from '../types'

export const stageList: LessonStageMeta[] = [
  {
    id: 'challenge',
    stepNumber: 1,
    titleEn: 'The Challenge',
    titleZh: '问题提出',
    shortHint: '先验证一条直线是否足够',
    headline: '一条简单规则，真的能把这些点分开吗？',
    description: '如果网络只有输入层和输出层，它形成的只是一个直接的线性决策规则。',
  },
  {
    id: 'io',
    stepNumber: 2,
    titleEn: 'Inputs and Outputs',
    titleZh: '输入与输出',
    shortHint: '理解输入和输出分别承担什么角色',
    headline: '输入描述当前情境，输出给出最终判断。',
    description:
      '输入层本身不负责求解问题，它只把坐标值传入网络；输出层把内部计算结果变成最终结论。',
  },
  {
    id: 'hidden',
    stepNumber: 3,
    titleEn: 'Hidden Units',
    titleZh: '隐藏单元',
    shortHint: '观察中间特征如何切分几何空间',
    headline: '隐藏层能够构造有用的中间特征。',
    description:
      '网络不必一次性解决整个降落判断，它可以把复杂任务拆成几个更简单的几何检测步骤。',
  },
  {
    id: 'activation',
    stepNumber: 4,
    titleEn: 'Activation',
    titleZh: '激活作用',
    shortHint: '对比线性堆叠与非线性响应',
    headline: '只有经过非线性变换，隐藏层才真正带来表达力提升。',
    description:
      '如果每一层都只是线性变换，那么层数再多也仍可折叠为一个整体线性映射。真正让隐藏单元在不同区域产生不同响应的，是激活函数。',
  },
  {
    id: 'build',
    stepNumber: 5,
    titleEn: 'Build the Network',
    titleZh: '构造网络',
    shortHint: '亲手布置四个中间检测器',
    headline: '配置四个中间检测器，再把它们组合成最终降落判断。',
    description:
      '这里不是让某一个单元独自解决全部问题，而是先构造多个简单的中间响应，再由输出层把它们组合起来。',
  },
  {
    id: 'trace',
    stepNumber: 6,
    titleEn: 'Trace a Change',
    titleZh: '追踪变化',
    shortHint: '预测局部修改会影响哪些后续计算',
    headline: '在改动之前，先预测网络中哪些部分会受到影响。',
    description:
      '一次前向计算的信息流总是从前面的层走向后面的层；后面的改动不会反过来改写原始输入坐标。',
  },
  {
    id: 'summary',
    stepNumber: 7,
    titleEn: 'What You Learned',
    titleZh: '学习总结',
    shortHint: '用完整概念闭环收束本单元',
    headline: '为什么隐藏层和激活函数如此重要？',
    description:
      '神经网络的表达力增强，并不是因为节点数量变多，而是因为它构造了有意义的中间响应，并用非线性激活把这些响应转成更丰富的决策结构。',
  },
]
