---
title: "A2A协议"
date: 2026-04-30
tag: "A2A"
---

> Produced by Qoder


### A2A 是什么

A2A（Agent2Agent）是 Google 在 2025 年 4 月发布的一个开放协议，解决的问题是：**AI Agent 之间怎么互相合作**。

### A2A 和 MCP 的关系

MCP 解决的是"AI 怎么调用工具"的问题——AI 是老板，工具是打工仔，老板说干嘛就干嘛。

但还有一种场景：**两个 AI Agent 需要合作完成一件事**。

比如你有一个"招聘 Agent"和一个"日程 Agent"，招聘 Agent 筛完简历后想安排面试，它需要跟日程 Agent 商量："这个候选人下周有空，你帮我找个会议室订个时间？"日程 Agent 可能会回："下周三下午可以，但需要候选人确认。"

这不是简单的"调用一个函数"，而是两个 Agent 之间的**协商、对话、来回沟通**。MCP 解决不了这个问题，A2A 就是来解决这个的。

```
MCP：  AI  →  工具      （主仆关系，单次调用）
A2A：  AI  ⇄  AI        （协作关系，多轮对话）
```

一句话：**MCP 是 AI 和工具之间的协议，A2A 是 AI 和 AI 之间的协议。** 两者互补，不冲突。

### A2A 的几个核心概念

只有四个东西需要记住：

#### 1. Agent Card（智能体名片）

每个 Agent 对外发布一张"名片"，放在固定地址 `/.well-known/agent.json`，告诉别人"我是谁、我能干什么"。

```json
// 比如一个"翻译Agent"的名片
{
  "name": "翻译助手",
  "description": "支持中英日韩互译",
  "url": "https://translate-agent.example.com",
  "skills": [
    { "id": "translate", "name": "文本翻译" },
    { "id": "proofread", "name": "语法校对" }
  ],
  "capabilities": {
    "streaming": true,
    "pushNotifications": true
  }
}
```

类比：就像你在钉钉上看别人的个人资料——姓名、部门、擅长什么。其他 Agent 看了这张名片就知道"哦，这个 Agent 能帮我翻译"。

#### 2. Task（任务）

A2A 里的核心交互单元是"任务"。一个 Agent 给另一个 Agent 派任务，任务有状态流转：

```
submitted（已提交）
    ↓
working（处理中）
    ↓
input-required（需要更多信息）  ← 可能来回几次
    ↓
completed（完成）  或  failed（失败）
```

跟 MCP 最大的区别在这里：MCP 调工具是**一次性的**——调一下，拿到结果，结束。A2A 的任务是**有状态的**，可能持续很长时间，中间可能需要多次沟通。

比如：
```
招聘Agent → 日程Agent："帮我安排一场面试"     （submitted）
日程Agent → 招聘Agent："候选人什么时候有空？"  （input-required）
招聘Agent → 日程Agent："下周三或周四"          （working）
日程Agent → 招聘Agent："已安排周三下午2点"     （completed）
```

#### 3. Message（消息）

Agent 之间通过消息沟通。每条消息有角色区分：

- `user` — 客户端 Agent 发的
- `agent` — 服务端 Agent 发的

消息内容可以包含三种类型：
- **TextPart**：纯文本
- **FilePart**：文件（图片、PDF 等）
- **DataPart**：结构化 JSON 数据

所以 A2A 天然支持多模态——Agent 之间不仅能聊文字，还能互传文件和结构化数据。

#### 4. Artifact（产出物）

任务完成时，服务端 Agent 通过 Artifact 返回最终结果。可以是翻译好的文档、生成的图片、分析报告等。

### 通信方式

A2A 基于 HTTP + JSON-RPC 2.0（跟 MCP 一样的消息格式），支持三种交互模式：

```
1. 请求/响应    —— 简单场景，问一下答一下
2. SSE 流式    —— 任务处理中实时推送进度
3. Webhook 推送 —— 长时间任务完成后回调通知
```

### 一个完整的例子

假设你有一个"旅行规划 Agent"和一个"机票 Agent"：

```
1. 旅行Agent 先看机票Agent 的名片（Agent Card）
   GET https://flight-agent.com/.well-known/agent.json
   → "哦，它能搜航班、能订票"

2. 旅行Agent 创建一个任务
   POST https://flight-agent.com/a2a
   {
     "method": "tasks/send",
     "params": {
       "id": "task-001",
       "message": {
         "role": "user",
         "parts": [{"type":"text", "text":"搜一下5月1日北京到上海的航班"}]
       }
     }
   }

3. 机票Agent 处理中...可能需要更多信息
   → 返回 status: "input-required"
   → "请问偏好经济舱还是商务舱？"

4. 旅行Agent 补充信息
   → "经济舱，最便宜的"

5. 机票Agent 完成任务
   → status: "completed"
   → artifact: [航班列表数据]
```

### MCP vs A2A 对比

| | MCP | A2A |
|---|---|---|
| **解决什么** | AI 调用工具 | AI 和 AI 协作 |
| **关系** | 主仆（Client 控制 Server） | 对等（两个 Agent 协商） |
| **交互模式** | 无状态，调一次就完 | 有状态，多轮对话 |
| **典型场景** | 查数据库、调 API、读文件 | 跨部门协作、委托任务、多 Agent 工作流 |
| **发现机制** | 配置文件写死 | Agent Card，自动发现 |
| **消息内容** | 主要是文本 | 文本 + 文件 + 结构化数据 |

### 一句话总结

**MCP 让 AI 能用工具，A2A 让 AI 能跟 AI 合作。** 未来的 AI 系统很可能两个都用——每个 Agent 通过 MCP 连接自己的工具，通过 A2A 跟其他 Agent 协同工作。
