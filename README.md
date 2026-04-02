# 智联万象 MindVista——AI通识课教学交互式课件

本项目是一个围绕“为什么神经网络需要隐藏层与激活函数”设计的本地单页教学作品。当前实现聚焦一个完整知识单元：`Chapter 1 从输入到决策——神经网络模型的秘密`。

## 运行方式

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
```

Windows 原型打包：

```bash
npm run prototype:build
```

打包完成后，双击 `release/mindvista-launcher.exe` 即可启动本地服务并自动打开默认浏览器。

## 当前实现内容

- 固定顶部栏、左侧“本单元学习环节”导航、中央双联交互区、右侧概念面板
- 7 个连续教学环节，覆盖线性失败、输入输出、隐藏单元、激活作用、构造网络、追踪变化、总结收束
- SVG 网络视图与 landing map 联动
- Teacher mode、Reset lesson、节点/连接检查器、探针点拖拽、边界拖拽与构造式沙盒
- 本地 deterministic 数据集与安全降落区域

## 目录说明

- `src/components/`：课程壳层、导航、网络图、地图画布、概念面板、检查器
- `src/data/`：课程元数据、教学环节配置、固定样本点与预设参数
- `src/lib/`：几何计算与网络表达逻辑
- `src/store/`：全局 lesson 状态
- `docs/teaching-design.md`：教学设计说明
- `scripts/mindvista-launcher.cjs`：本地静态服务器与浏览器自动启动逻辑
- `release/mindvista-launcher.exe`：Windows 可验收原型产物

## 说明

- 本项目默认以 UTF-8 文件编码维护。
- UI 呈现强调“完整作品中的完整教学单元”，不展示未实现入口或平台化占位。
- 当前已通过 `npm run build` 构建验证。
