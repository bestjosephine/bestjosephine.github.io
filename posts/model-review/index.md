---
title: "大模型代码评审方案"
date: 2026-04-21
tag: "Model"
---

```




#!/usr/bin/env python3
"""
多模型代码互审脚本
使用阿里云 DashScope（通义千问）的两个模型互相 review 代码。
模型 A（Reviewer 1）和 模型 B（Reviewer 2）分别独立审查，然后交叉评审对方的意见。

使用方式：
    python code_review.py <代码文件路径>

首次使用前：
    1. 安装依赖：pip install openai
    2. 设置 API Key（二选一）：
       - 环境变量：export DASHSCOPE_API_KEY="sk-xxxx"
       - 或直接修改下方 CONFIG 中的 api_key
"""

import sys
import os
import argparse
import json
from datetime import datetime

# ============================================================
#  配置区 —— 根据你的情况修改
# ============================================================
CONFIG = {
    # DashScope API Key（优先使用环境变量 DASHSCOPE_API_KEY）
    "api_key": "",

    # DashScope 兼容 OpenAI 的接口地址
    "base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1",

    # 两个模型配置：使用不同模型可以获得更多样化的审查视角
    "reviewer_1": {
        "name": "审查员 A",
        "model": "qwen3.6-plus",    # 能力强，适合深度审查
        "temperature": 0.3,
    },
    "reviewer_2": {
        "name": "审查员 B",
        "model": "qwen3.6-plus",    # 同模型不同温度，提供差异化视角
        "temperature": 0.7,
    },

    # 互审轮次（建议 1-2 轮，太多轮容易重复）
    "review_rounds": 1,

    # 审查报告输出目录（空字符串表示输出到代码文件同目录）
    "output_dir": "",
}

# ============================================================
#  Prompt 模板
# ============================================================
INITIAL_REVIEW_PROMPT = """你是一位资深软件工程师，正在进行代码审查（Code Review）。

请对以下代码进行全面审查，从以下维度分析：

1. **正确性**：逻辑是否正确？有没有 bug 或边界条件遗漏？
2. **安全性**：有没有安全漏洞？（如 SQL 注入、XSS、硬编码密钥等）
3. **性能**：有没有性能问题？算法复杂度是否合理？
4. **可读性**：命名、结构、注释是否清晰？
5. **可维护性**：代码是否易于修改和扩展？有没有重复代码？
6. **最佳实践**：是否符合该语言的惯用写法和社区规范？

请按优先级排序你的发现：
- 🔴 严重问题（必须修复）
- 🟡 建议改进（推荐修复）
- 🟢 小建议（锦上添花）

对于每个问题，请给出：
- 具体位置（行号或代码片段）
- 问题描述
- 修改建议（最好附上改进后的代码示例）

最后给出一个整体评分（1-10 分）和总结。

---
代码如下：

```
{code}
```
"""

CROSS_REVIEW_PROMPT = """你是一位资深软件工程师。另一位审查员已经对一段代码给出了 review 意见。
请你审查这些意见：

1. 这些意见是否正确？有没有误判的？
2. 有没有被遗漏的重要问题？
3. 建议的优先级排序是否合理？
4. 修改建议是否合适？有没有更好的方案？

请给出你的交叉评审意见，指出你同意和不同意的地方，并补充任何遗漏的问题。

---
被审查的代码：

```
{code}
```

---
另一位审查员的意见：

{other_review}
"""

SUMMARY_PROMPT = """你是一位技术负责人。两位审查员已经完成了代码审查和交叉评审。
请你综合他们的意见，生成一份最终的代码审查报告。

要求：
1. 合并去重两位审查员的发现
2. 给出最终的优先级排序
3. 对于有争议的问题，给出你的判断
4. 列出明确的 Action Items（待办事项）
5. 给出最终的整体评分（1-10 分）

---
被审查的代码：

```
{code}
```

---
审查员 A 的初始审查：
{review_a}

---
审查员 B 的初始审查：
{review_b}

---
审查员 A 对 B 的交叉评审：
{cross_a}

---
审查员 B 对 A 的交叉评审：
{cross_b}
"""


# ============================================================
#  核心逻辑
# ============================================================

def get_api_key():
    """获取 API Key"""
    key = os.environ.get("DASHSCOPE_API_KEY", "") or CONFIG["api_key"]
    if not key:
        print("❌ 错误：未设置 API Key！")
        print()
        print("请通过以下方式之一设置：")
        print("  方式一：设置环境变量")
        print("    export DASHSCOPE_API_KEY=\"sk-xxxx\"")
        print()
        print("  方式二：直接修改脚本中 CONFIG 的 api_key 字段")
        print()
        print("  获取 API Key：https://bailian.console.aliyun.com/?apiKey=1#/api-key")
        sys.exit(1)
    return key


def call_model(api_key, model_config, messages):
    """调用模型 API（使用 OpenAI 兼容接口）"""
    from openai import OpenAI

    client = OpenAI(
        api_key=api_key,
        base_url=CONFIG["base_url"],
    )

    response = client.chat.completions.create(
        model=model_config["model"],
        messages=messages,
        temperature=model_config.get("temperature", 0.3),
    )

    return response.choices[0].message.content


def read_code_file(file_path):
    """读取代码文件"""
    if not os.path.exists(file_path):
        print(f"❌ 错误：文件不存在 - {file_path}")
        sys.exit(1)

    with open(file_path, "r", encoding="utf-8") as f:
        code = f.read()

    if not code.strip():
        print("❌ 错误：文件内容为空")
        sys.exit(1)

    return code


def print_section(title, content):
    """格式化输出一个段落"""
    border = "=" * 60
    print(f"\n{border}")
    print(f"  {title}")
    print(f"{border}\n")
    print(content)
    print()


def run_review(file_path):
    """执行完整的互审流程"""
    api_key = get_api_key()
    code = read_code_file(file_path)
    file_name = os.path.basename(file_path)

    r1 = CONFIG["reviewer_1"]
    r2 = CONFIG["reviewer_2"]

    print(f"\n🔍 开始审查文件：{file_name}")
    print(f"   审查员 A：{r1['name']}（{r1['model']}）")
    print(f"   审查员 B：{r2['name']}（{r2['model']}）")
    print(f"   互审轮次：{CONFIG['review_rounds']}")

    # 收集所有结果用于生成报告
    all_results = {
        "file": file_name,
        "file_path": os.path.abspath(file_path),
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }

    # ---- 第一步：两个模型分别独立审查 ----
    print(f"\n⏳ 第 1 步：{r1['name']} 正在独立审查...")
    review_a = call_model(api_key, r1, [
        {"role": "user", "content": INITIAL_REVIEW_PROMPT.format(code=code)}
    ])
    print_section(f"{r1['name']} 的审查结果", review_a)
    all_results["review_a"] = review_a

    print(f"⏳ 第 2 步：{r2['name']} 正在独立审查...")
    review_b = call_model(api_key, r2, [
        {"role": "user", "content": INITIAL_REVIEW_PROMPT.format(code=code)}
    ])
    print_section(f"{r2['name']} 的审查结果", review_b)
    all_results["review_b"] = review_b

    # ---- 第二步：交叉评审 ----
    print(f"⏳ 第 3 步：{r1['name']} 正在评审 {r2['name']} 的意见...")
    cross_a = call_model(api_key, r1, [
        {"role": "user", "content": CROSS_REVIEW_PROMPT.format(
            code=code, other_review=review_b
        )}
    ])
    print_section(f"{r1['name']} 对 {r2['name']} 的交叉评审", cross_a)
    all_results["cross_review_a"] = cross_a

    print(f"⏳ 第 4 步：{r2['name']} 正在评审 {r1['name']} 的意见...")
    cross_b = call_model(api_key, r2, [
        {"role": "user", "content": CROSS_REVIEW_PROMPT.format(
            code=code, other_review=review_a
        )}
    ])
    print_section(f"{r2['name']} 对 {r1['name']} 的交叉评审", cross_b)
    all_results["cross_review_b"] = cross_b

    # ---- 第三步：生成综合报告 ----
    print("⏳ 第 5 步：正在生成综合审查报告...")
    summary = call_model(api_key, r1, [
        {"role": "user", "content": SUMMARY_PROMPT.format(
            code=code,
            review_a=review_a,
            review_b=review_b,
            cross_a=cross_a,
            cross_b=cross_b,
        )}
    ])
    print_section("📋 综合审查报告", summary)
    all_results["summary"] = summary

    # ---- 保存报告 ----
    output_dir = CONFIG["output_dir"] or os.path.dirname(os.path.abspath(file_path))
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_name = f"review_{os.path.splitext(file_name)[0]}_{timestamp}.md"
    report_path = os.path.join(output_dir, report_name)

    report_content = generate_markdown_report(all_results)
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report_content)

    print(f"\n✅ 审查完成！报告已保存到：{report_path}")


def generate_markdown_report(results):
    """生成 Markdown 格式的审查报告"""
    r1 = CONFIG["reviewer_1"]
    r2 = CONFIG["reviewer_2"]

    report = f"""# 代码审查报告

- **文件**：`{results['file']}`
- **路径**：`{results['file_path']}`
- **时间**：{results['timestamp']}
- **审查员 A**：{r1['name']}（{r1['model']}）
- **审查员 B**：{r2['name']}（{r2['model']}）

---

## 1. {r1['name']} 的独立审查

{results['review_a']}

---

## 2. {r2['name']} 的独立审查

{results['review_b']}

---

## 3. {r1['name']} 对 {r2['name']} 的交叉评审

{results['cross_review_a']}

---

## 4. {r2['name']} 对 {r1['name']} 的交叉评审

{results['cross_review_b']}

---

## 5. 综合审查报告

{results['summary']}
"""
    return report


# ============================================================
#  入口
# ============================================================
def main():
    parser = argparse.ArgumentParser(
        description="多模型代码互审工具 —— 使用通义千问双模型交叉审查代码",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例：
    python code_review.py main.py
    python code_review.py src/utils.js
    DASHSCOPE_API_KEY="sk-xxx" python code_review.py app.py
        """,
    )
    parser.add_argument("file", help="要审查的代码文件路径")
    parser.add_argument(
        "--rounds", type=int, default=None,
        help="互审轮次（默认 1 轮）",
    )

    args = parser.parse_args()

    if args.rounds is not None:
        CONFIG["review_rounds"] = args.rounds

    run_review(args.file)


if __name__ == "__main__":
    main()
```
