import { demoHiddenUnits } from './dataset'
import type { PracticeQuestionConfig } from '../types'

const finalDetector = demoHiddenUnits[3]

export const practiceQuestions: PracticeQuestionConfig[] = [
  {
    id: 'q1',
    titleZh: '第 1 题：看懂单层网络的局限',
    instructionZh: '观察图中的网络和样本分布，再选择最合适的说法。',
    assessmentFocusZh:
      '这题检查你是否理解：只有输入层和输出层时，模型的表达能力通常比较有限。',
    hintZh: '回想课程开头：为什么一条直接规则总是很难完整包住安全区？',
    interactionType: 'multiple-choice',
    contentLayout: 'split-network-map',
    promptZh:
      '下面这个任务中，绿色点表示“安全”，红色点表示“不安全”。如果一个网络只有输入层和输出层，没有隐藏层，那么它最可能遇到什么问题？',
    options: [
      { id: 'A', labelZh: '它可以轻松围出封闭安全区' },
      { id: 'B', labelZh: '它通常只能形成一条简单的线性分界' },
      { id: 'C', labelZh: '它会自动学会隐藏特征' },
      { id: 'D', labelZh: '它的输入值会改变地图坐标' },
    ],
    correctAnswer: 'B',
    preSubmitRightPanelCopy: {
      focusTitle: '这题在考什么',
      focusBody:
        '这题检查你是否理解：只有输入层和输出层时，模型的表达能力通常比较有限。',
      hintTitle: '作答提示',
      hintBody: '回想课程开头：为什么一条直接规则总是很难完整包住安全区？',
    },
    postSubmitCorrectCopy:
      '答对了。没有隐藏层时，模型通常只能形成一个直接的线性决策规则，这对封闭安全区域往往不够。',
    postSubmitIncorrectCopy:
      '这题答错了。关键不是“能不能算”，而是“能表达出什么形状”。',
    postSubmitExplanationZh:
      '只有输入层和输出层时，模型往往只能形成一条简单分界。它可以移动位置，但很难直接表示一个完整的封闭安全区域。',
    successCondition: '选择正确选项 B 并提交。',
    analyticsTags: ['linear-limit', 'single-layer'],
  },
  {
    id: 'q2',
    titleZh: '第 2 题：激活函数为什么重要',
    instructionZh: '比较下列说法，选出最合适的一句。',
    assessmentFocusZh:
      '这题检查你是否理解：隐藏层真正变得有用，还需要非线性激活的参与。',
    hintZh: '想一想：课程里为什么强调“不是只多了几个点”？',
    interactionType: 'multiple-choice',
    contentLayout: 'split-compare',
    promptZh: '下面关于激活函数的说法，哪一句最合适？',
    options: [
      { id: 'A', labelZh: '激活函数只是让界面更复杂' },
      { id: 'B', labelZh: '只要有隐藏层，激活函数可有可无' },
      { id: 'C', labelZh: '激活函数让隐藏单元能在不同区域产生不同响应' },
      { id: 'D', labelZh: '激活函数会改变输入层里的坐标值' },
    ],
    correctAnswer: 'C',
    preSubmitRightPanelCopy: {
      focusTitle: '这题在考什么',
      focusBody:
        '这题检查你是否理解：隐藏层真正变得有用，还需要非线性激活的参与。',
      hintTitle: '作答提示',
      hintBody: '想一想：课程里为什么强调“不是只多了几个点”？',
    },
    postSubmitCorrectCopy:
      '答对了。隐藏层本身不是全部答案，非线性激活让隐藏单元在不同区域表现不同，这才真正提升了表达能力。',
    postSubmitIncorrectCopy:
      '这题答错了。激活函数的作用不是装饰，也不是改变输入值。',
    postSubmitExplanationZh:
      '激活函数让隐藏单元不再只是线性传递，而是能在不同区域产生不同强度的响应。这样输出层才有机会组合出更丰富的决策边界。',
    successCondition: '选择正确选项 C 并提交。',
    analyticsTags: ['activation', 'nonlinearity'],
  },
  {
    id: 'q3',
    titleZh: '第 3 题：把结构和作用对应起来',
    instructionZh: '拖动左侧概念标签，与右侧作用卡片完成对应。',
    assessmentFocusZh:
      '这题检查你是否真的分清了网络中各部分的角色，而不是只记住它们的名字。',
    hintZh:
      '想想课程里那句主线：输入提供信息，隐藏层组织中间特征，激活让这些特征真正有表达力，输出再给出最终判断。',
    interactionType: 'drag-match',
    contentLayout: 'match-board',
    promptZh: '把左侧概念标签与右侧作用卡片一一对应起来。',
    correctAnswer: {
      输入层: '接收当前样本的信息',
      隐藏层: '构造中间特征或简单检测器',
      激活函数: '让响应变得具有非线性',
      输出层: '给出最终判断结果',
    },
    preSubmitRightPanelCopy: {
      focusTitle: '这题在考什么',
      focusBody:
        '这题检查你是否真的分清了网络中各部分的角色，而不是只记住它们的名字。',
      hintTitle: '作答提示',
      hintBody:
        '想想课程里那句主线：输入提供信息，隐藏层组织中间特征，激活让这些特征真正有表达力，输出再给出最终判断。',
    },
    postSubmitCorrectCopy:
      '答对了。这四个概念不是平行堆在一起的名词，它们在网络里承担不同角色。',
    postSubmitIncorrectCopy:
      '还有对应关系需要再看一眼。先别急着记术语，先想它们各自负责什么。',
    postSubmitExplanationZh:
      '输入层负责把当前样本送进网络，隐藏层负责构造更有用的中间检测条件，激活函数让这些条件不再只是线性传递，输出层再把这些响应组合成最终判断。',
    successCondition: '把四个概念标签全部对应到正确作用卡片后提交。',
    analyticsTags: ['structure-roles', 'matching'],
  },
  {
    id: 'q4',
    titleZh: '第 4 题：输出层在做什么',
    instructionZh: '结合图示，选出输出层最合理的作用。',
    assessmentFocusZh:
      '这题检查你是否理解：输出层不是从零创造智能，而是在组合前面已经形成的中间响应。',
    hintZh:
      '回想 Build the Network 那一章：最后一步到底是在补输入、改激活，还是在组合已有检测器？',
    interactionType: 'multiple-choice',
    contentLayout: 'split-process',
    promptZh:
      '现在你已经有两个输入节点和四个隐藏单元。为了让网络更好地表示复杂安全区域，输出层最合理的工作是什么？',
    options: [
      { id: 'A', labelZh: '输出层负责重新生成输入坐标' },
      { id: 'B', labelZh: '输出层把隐藏层的响应组合成最终决策' },
      { id: 'C', labelZh: '输出层代替激活函数决定非线性' },
      { id: 'D', labelZh: '输出层让隐藏层自动消失' },
    ],
    correctAnswer: 'B',
    preSubmitRightPanelCopy: {
      focusTitle: '这题在考什么',
      focusBody:
        '这题检查你是否理解：输出层不是从零创造智能，而是在组合前面已经形成的中间响应。',
      hintTitle: '作答提示',
      hintBody:
        '回想 Build the Network 那一章：最后一步到底是在补输入、改激活，还是在组合已有检测器？',
    },
    postSubmitCorrectCopy:
      '答对了。输出层的重点是组合隐藏层已经形成的中间响应，得到最终判断。',
    postSubmitIncorrectCopy:
      '这题答错了。输出层的关键不是重新输入，也不是替代激活函数。',
    postSubmitExplanationZh:
      '隐藏层负责形成局部检测器或中间特征，输出层读取这些响应，并把它们整合成最后的安全或不安全判断。',
    successCondition: '选择正确选项 B 并提交。',
    analyticsTags: ['output-layer', 'combination'],
  },
  {
    id: 'q5',
    titleZh: '第 5 题：补上最后一个检测条件',
    instructionZh: '移动并旋转最后一个隐藏单元对应的边界，让安全区域判断更完整。',
    assessmentFocusZh:
      '这题检查你是否能把“隐藏单元是中间检测器”这个想法用在一个很小的操作里。',
    hintZh: '前面三个隐藏单元已经分别表示了三个简单条件。现在看看哪一侧还没有被单独约束。',
    interactionType: 'boundary-adjustment',
    contentLayout: 'split-workbench',
    promptZh: '把最后一个边界检测器放到合适的位置，让剩余错分点数继续下降。',
    validationRule: {
      targetAngle: finalDetector.angle,
      targetOffset: finalDetector.offset,
      angleTolerance: 0.42,
      offsetTolerance: 0.7,
      requiredSide: finalDetector.side,
      maxMismatches: 4,
    },
    preSubmitRightPanelCopy: {
      focusTitle: '这题在考什么',
      focusBody:
        '这题检查你是否能把“隐藏单元是中间检测器”这个想法用在一个很小的操作里。',
      hintTitle: '作答提示',
      hintBody:
        '前面三个隐藏单元已经分别表示了三个简单条件。现在看看哪一侧还没有被单独约束。',
    },
    postSubmitCorrectCopy:
      '做得很好。你刚刚不是“随便调了一个参数”，而是补上了一个中间检测条件。',
    postSubmitIncorrectCopy:
      '这个方向还不太对。你现在缺的不是新输入，而是最后一个边界条件。',
    postSubmitExplanationZh:
      '隐藏层的力量来自多个简单检测条件的组合。补上最后一个条件后，输出层更容易形成完整的安全区域判断。',
    successCondition: '把最后一个边界检测器移动到合理角度和位置，并让剩余错分点数降到阈值以内后提交。',
    analyticsTags: ['detector-build', 'boundary-composition'],
  },
]

export const practiceTokens = ['输入层', '隐藏层', '激活函数', '输出层'] as const

export const practiceTargets = [
  '接收当前样本的信息',
  '构造中间特征或简单检测器',
  '让响应变得具有非线性',
  '给出最终判断结果',
] as const

export function getPracticeQuestionById(id: string) {
  return practiceQuestions.find((question) => question.id === id)
}
