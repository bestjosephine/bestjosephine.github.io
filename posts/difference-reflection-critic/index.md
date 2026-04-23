---
title: "Reflection和Critic机制的关系和区别"
date: 2026-04-23
tag: "Reflection, Critic"
---

> Produced by Qwen-3.6-Plus

Critic 和 Reflection 是**串行关系**，Critic 在前，Reflection 在后。可以理解为 Critic 是"发现问题的眼睛"，Reflection 是"解决问题的大脑"。

### 具体流程

**第一步：Planner 生成**

主流程调用召回子流程获取知识、策略、工具、案例后，Planner 节点的 LLM 基于这些 context 生成一个初步回复或动作。

**第二步：Critic 检查**

小模型对 Planner 输出做两轮校验：

- 幻觉校验 — 把生成内容与召回的知识/ISO 做对比，检查是否有编造成分
- 指令遵循校验 — 把生成内容与服务策略做对比，检查是否遵守了策略要求

Critic 输出一个判定结果：通过 / 不通过。如果通过，直接输出给用户，流程结束。

**第三步：Reflection 诊断（仅在 Critic 不通过时触发）**

Reflection 拿到 Critic 的失败信号后，进一步分析问题的根因，区分两种情况：

**情况 A：召回阶段已有正确答案，但 LLM 没用上。** 这说明是生成环节的问题。Reflection 会在 prompt 中显式标注被忽略的关键信息，加强约束后重新让 Planner 生成。这一步不需要重新召回，只需要重新生成。

**情况 B：召回阶段就没找到合适的答案。** 这说明是检索环节的问题。Reflection 会调整检索策略，比如换关键词、触发定向召回（从指定知识库精准查询），然后带着新的召回结果重新进入 Planner 生成。

**第四步：再次 Critic**

修正后的输出会再过一遍 Critic。如果仍然不通过，可以再循环一次，但为了控制 RT，通常设有最大重试次数（一般 1-2 次）。超过次数后走兜底逻辑（安全回复或转人工）。

### 完整时序

```
Planner 生成
    ↓
Critic 检查 ──── 通过 ──→ 输出给用户
    ↓ 不通过
Reflection 诊断
    ↓
    ├─ 情况A（有答案没用）→ 强化prompt → 重新生成 → 再次 Critic
    │
    └─ 情况B（没召回到）→ 调整检索策略 → 重新召回 → 重新生成 → 再次 Critic
```

所以整个链路是严格串行的：生成 → 检查 → 诊断 → 修正 → 再检查。Reflection 不会在 Critic 之前或同时运行，因为它依赖 Critic 的判定结果来决定修正方向。
