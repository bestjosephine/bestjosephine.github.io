---
title: "MCP是什么？"
date: 2026-04-30
tag: "mcp"
---

## MCP 是什么？一个给实习生的入门指南

### 先来一个比喻

想象你在餐厅吃饭：

- **你（顾客）** = AI 助手（比如 QoderWork）
- **菜单** = MCP 协议
- **厨房** = MCP Server（你写的程序）
- **服务员** = 传输层（stdio / HTTP）

你不需要自己炒菜，你只需要看菜单点菜，服务员把你的需求传给厨房，厨房做好了再端给你。

MCP（Model Context Protocol）就是这个"菜单+服务员"的标准。它定义了 **AI 怎么发现和调用外部能力**。

---

### 为什么需要 MCP？

在没有 MCP 之前，如果你想让 AI 助手具备某种能力（比如查数据库、发消息、操作文件），你需要为每个 AI 平台单独写一套对接代码。

```
没有 MCP 的世界：

你的工具 ←→ 专门适配 ChatGPT 的代码
你的工具 ←→ 专门适配 Claude 的代码
你的工具 ←→ 专门适配 QoderWork 的代码
... 每个平台都要写一遍
```

有了 MCP 之后：

```
你的工具 ←→ MCP Server（写一次）←→ 任何支持 MCP 的 AI 客户端都能用
```

就像 USB 接口一样，统一标准之后，一根线到处用。

---

### MCP Server 的三个核心概念

只有三个东西需要记住：

#### 1. Tool（工具）—— 可以被调用的函数

最重要的概念。你可以把任何函数暴露为一个 Tool，AI 就能调用它。

```
Tool 就像一个 API 接口：
- 有名字（叫什么）
- 有描述（做什么）
- 有参数（需要什么输入）
- 有返回值（产出什么）
```

#### 2. Resource（资源）—— 可以被读取的数据

类似于 GET 接口，提供一些数据让 AI 读取。比如配置信息、模板内容等。

#### 3. Transport（传输方式）—— Server 和 Client 怎么通信

目前主要有两种：
- **stdio**：通过标准输入/输出通信（最常用，Client 把 Server 当子进程启动）
- **HTTP SSE**：通过 HTTP 通信（适合远程部署）

---

### 逐行解释 server.js

下面把代码拆开，一行一行说清楚。

```javascript
// ========== 第一步：导入依赖 ==========

// McpServer 是 MCP 的核心类，用来创建一个 Server
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// StdioServerTransport 是 stdio 传输方式
// "通过标准输入输出跟客户端通信"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// zod 是一个参数校验库，用来定义"工具接收什么参数"
import { z } from "zod";
```

```javascript
// ========== 第二步：创建 Server 实例 ==========

const server = new McpServer({
  name: "simple-hello-server",  // 给你的 Server 起个名字
  version: "1.0.0",             // 版本号
});

// 就像 Express 里的 const app = express() 一样
// 这一步只是"创建"，还没启动
```

```javascript
// ========== 第三步：注册一个工具 ==========

server.tool(
  "hello",                    // 参数1：工具名称（AI 通过这个名字来调用）
  "向指定用户打招呼",         // 参数2：工具描述（AI 通过这个来理解工具能干嘛）
  {
    name: z.string()          // 参数3：参数定义
         .describe("用户的名字")  // 这个工具需要一个字符串类型的 name 参数
  },
  async ({ name }) => {       // 参数4：执行函数（工具被调用时运行的代码）
    return {
      content: [
        {
          type: "text",
          text: `你好，${name}！欢迎使用 MCP！`,
        },
      ],
    };
    // 返回值格式是固定的：content 数组，里面放 text 类型的内容
  }
);

// 类比：这就像在 Express 里写
//   app.post("/hello", (req, res) => { ... })
// 只不过调用方不是浏览器，而是 AI
```

```javascript
// ========== 第四步：启动服务 ==========

async function main() {
  const transport = new StdioServerTransport();
  // 创建一个 stdio 传输通道

  await server.connect(transport);
  // 把 Server 连接到这个传输通道上，开始监听请求

  console.error("Server is running...");
  // 注意：用 console.error 而不是 console.log
  // 因为 stdout（console.log）被 MCP 协议占用了
  // stderr（console.error）才是给人看的日志
}

main();
```

---

### 逐行解释 test-client.js

```javascript
// ========== 客户端：模拟 AI 调用 MCP Server ==========

// 导入客户端类
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {

  // 1. 创建传输层 —— 告诉客户端"用 node server.js 启动 Server"
  const transport = new StdioClientTransport({
    command: "node",      // 运行什么命令
    args: ["server.js"],  // 命令参数
  });
  // 客户端会自动把 server.js 当子进程启动
  // 然后通过 stdin/stdout 跟它通信

  // 2. 创建客户端并连接
  const client = new Client({ name: "test-client", version: "1.0.0" });
  await client.connect(transport);
  // 连接成功后，客户端和服务端就可以互相通信了

  // 3. 发现工具 —— "你有什么工具可以用？"
  const tools = await client.listTools();
  // 返回 Server 注册的所有工具列表

  // 4. 调用工具 —— "帮我运行 hello 工具，参数是 name=张三"
  const result = await client.callTool({
    name: "hello",               // 调用哪个工具
    arguments: { name: "张三" }  // 传什么参数
  });
  // result.content[0].text === "你好，张三！欢迎使用 MCP！"

  // 5. 读取资源
  const resource = await client.readResource({ uri: "greeting://template" });
  // 读取 Server 提供的资源数据
}
```

---

### 实际使用场景中的数据流

当你在 QoderWork 中使用 MCP 时，完整流程是这样的：

```
你说："帮我向张三打招呼"
        │
        ▼
   QoderWork（AI 客户端）
   AI 想："我有一个 hello 工具可以用"
        │
        ▼
   QoderWork 调用 MCP Client
   发送：{ method: "tools/call", params: { name: "hello", arguments: { name: "张三" } } }
        │
        ▼  （通过 stdio 传输）
        │
   你的 MCP Server（server.js）
   收到请求 → 执行 hello 函数 → 返回结果
        │
        ▼
   QoderWork 收到："你好，张三！欢迎使用 MCP！"
   AI 把结果组织成自然语言回复给你
```

---

### 如何接入到 QoderWork

写好 server.js 之后，你只需要在 QoderWork 的 MCP 配置中加一条：

```json
{
  "mcpServers": {
    "hello": {
      "command": "node",
      "args": ["/你的路径/mcp-simple-example/server.js"]
    }
  }
}
```

QoderWork 启动时会自动运行你的 Server，然后 AI 就能发现和使用你定义的工具了。

---

### 小结

| 你写的东西 | 类比 | 作用 |
|-----------|------|------|
| `new McpServer()` | `express()` | 创建服务 |
| `server.tool()` | `app.post()` | 注册一个可调用的接口 |
| `server.resource()` | `app.get()` | 注册一个可读取的数据 |
| `StdioServerTransport` | `app.listen(3000)` | 选择通信方式并启动 |
| `zod` schema | Swagger 参数定义 | 告诉 AI 参数是什么类型 |

一句话总结：**MCP Server 就是给 AI 写的后端服务，Tool 就是 API 接口，Transport 就是监听方式。**
