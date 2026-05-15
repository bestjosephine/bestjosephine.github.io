---
title: "Beyond CRUD — Thoughts After Two Years of Work"
date: 2026-05-15
tag: "diary"
---

> Coordinated with Claude-4.7-Opus

A friend asked me, "What's the biggest difficulty you have solved in your project?" I was confused for almost half a minute.

As a backend programmer, my daily job is to complete requirements from the product manager. I suddenly realized that I hadn't made progress in the last two years. The thought really upset me a lot. 

Plus, my routine job also let me down. I had to fulfill a business requirement. So I wrote a technical document, which was supposed to be reviewed by my colleagues. Then my leader asked me to explain the whole process, but I didn't know what to say. She then pointed out lots of problems. Before the meeting, I hadn't thought about the user interaction. She told me, "Think about the data flow; don't avoid it." And when she spoke logically, I felt she was shining. Although I didn't like that she had pushed me a lot in the last 4 weeks, I fell in love with her at that moment.

After the one-hour meeting, she sent me a message: "I feel like your proposal is not deep enough. You didn't consider a lot of things. Think deeper and make more progress!" It was comforting. She gave me suggestions and encouragement. I wish I could be a good colleague like her. 

But I have to say, I have been feeling bad recently for two reasons. How can I improve my technical skills, rather than being a simple CRUD programmer? It's a real and good question.

Claude gave me several suggestions. I will think them over and pick some to practice.

Here are its suggestions.

Why this happens:

  Business requirements rarely push you technically. You use the same framework, same patterns, same database queries. You get faster, but not deeper. Years pass, and
   you feel like a "requirement machine."

  How to break out — realistically, within your job:

  1. Go deeper on what you already do
  - You write APIs? Learn what happens beneath your framework — how HTTP connections are managed, how the ORM generates SQL, how connection pooling works.
  - Read the source code of the tools you use daily. This alone separates you from most programmers.

  2. Ask "why" more at work
  - Why is this query slow? Don't just add an index — understand the query planner.
  - Why did the server OOM? Don't just restart — learn memory profiling.
  - Turn routine bugs into learning opportunities.

  3. Pick ONE area to go deep
  - Don't try to learn everything. Pick one: distributed systems, database internals, performance optimization, system design...
  - Spend 30 minutes a day. That's 180+ hours a year.

  4. Build one side project that scares you a little
  - Not another CRUD app. Build something that forces you into unfamiliar territory.
  - Examples: a simple message queue, a key-value store, a rate limiter from scratch.

  5. Your video project IS technical growth
  - Explaining model architecture forces you to truly understand it. Teaching is the deepest form of learning.

  The honest truth: Progress feels invisible day to day. But the programmer who reads framework source code, understands database internals, and can explain system
  design — that person is far ahead of someone with the same years of experience who only completed tickets.

  Small daily effort compounds. You don't need to change jobs — you need to change how you spend 30 minutes a day.
