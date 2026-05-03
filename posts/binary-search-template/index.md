---
title: "二分查找模板"
date: 2026-05-03
tag: "leetcode"
---

> Produced By DeepSeek

针对二分查找，常见的疑惑在于 **while 条件用 `<=` 还是 `<`**，以及结束循环后 **返回 `left`、`right` 还是 `mid`**。下面给出三种最常用的模板，并逐行注释。

---

## 1. 模板一：标准查找（查找确切存在的 `target`）

```java
int binarySearch(int[] nums, int target) {
    int left = 0;
    int right = nums.length - 1;   // 闭区间 [left, right]

    while (left <= right) {        // 当区间不为空时继续
        int mid = left + (right - left) / 2; // 防止溢出
        if (nums[mid] == target) {
            return mid;            // 找到了，直接返回索引
        } else if (nums[mid] < target) {
            left = mid + 1;        // 去右半部分（mid 已经比较过）
        } else {
            right = mid - 1;       // 去左半部分
        }
    }
    return -1;                     // 没找到
}
```

**要点**：
- `left <= right` 保证区间 `[left, right]` 为空时退出（即 `left > right`）。
- 每次缩小范围时，`mid` 已经被检查，所以 `left = mid + 1` 或 `right = mid - 1`。
- 找到目标时直接返回 `mid`；找不到返回 -1。

---

## 2. 模板二：查找第一个 ≥ target 的位置（下界，用于重复元素或插入位置）

```java
int lowerBound(int[] nums, int target) {
    int left = 0;
    int right = nums.length;       // 右边界为开区间 [left, right)

    while (left < right) {         // 区间不为空（至少一个元素）时继续
        int mid = left + (right - left) / 2;
        if (nums[mid] >= target) {
            right = mid;           // 收缩右边界，mid 可能是答案
        } else {
            left = mid + 1;        // mid < target，答案一定在右边
        }
    }
    return left;                   // 第一个 ≥ target 的索引，可能为 nums.length
}
```

**要点**：
- 区间定义为 `[left, right)` 左闭右开。初始 `right = nums.length`。
- 循环条件 `left < right`，退出时 `left == right`，该位置就是答案。
- 当 `nums[mid] >= target` 时，把 `right` 设为 `mid`（因为 `mid` 可能是答案，但右侧更大，所以保留 `mid`）。
- 否则 `nums[mid] < target`，答案一定在 `mid+1` 右侧，所以 `left = mid + 1`。
- 返回 `left`（或 `right` 相同）：第一个满足 `≥ target` 的索引。  
  如果所有元素都 `< target`，则返回 `nums.length`。

---

## 3. 模板三：查找最后一个 ≤ target 的位置（上界）

```java
int upperBound(int[] nums, int target) {
    int left = 0;
    int right = nums.length;       // 开区间 [left, right)

    while (left < right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] <= target) {
            left = mid + 1;        // mid 满足条件，但我们要找最后一个，所以向右试探
        } else {
            right = mid;           // mid > target，向左收缩
        }
    }
    return left - 1;               // 最后一个 ≤ target 的索引，可能为 -1
}
```

**要点**：
- 同样左闭右开区间。
- 当 `nums[mid] <= target` 时，答案至少是 `mid`，尝试向右，所以 `left = mid + 1`。
- 否则 `nums[mid] > target`，答案在左边，`right = mid`。
- 循环结束时 `left` 是第一个 `> target` 的位置，所以 `left - 1` 就是最后一个 `≤ target` 的位置。

---

## 总结「什么时候返回什么」

| 场景                         | 返回什么               | while 条件    | 区间表示         |
| ---------------------------- | ---------------------- | ------------- | ---------------- |
| 找确切 target（存在）        | 找到返回 `mid`，否则 -1 | `left <= right` | 闭区间 `[L,R]`   |
| 第一个 ≥ target 的位置       | 返回 `left`            | `left < right` | 左闭右开 `[L,R)` |
| 最后一个 ≤ target 的位置     | 返回 `left - 1`        | `left < right` | 左闭右开 `[L,R)` |

**核心记忆**：
- 闭区间写法：`while (left <= right)`，结束时 `left > right`，`right` 在 `left` 左边。
- 左闭右开写法：`while (left < right)`，结束时 `left == right`，该点就是搜索边界。

### 为什么 while 条件要这样设计？
- **`left <= right`**：确保区间内还有元素可以检查。当 `left == right` 时，区间只有一个元素，仍需判断。
- **`left < right`**：常用于左闭右开，当 `left == right` 意味着区间为空（因为右开不包含 `right`），无需再循环。这样能保证循环结束时 `left` 是有意义的边界值。

如果你希望理解得更透彻，可以记住 **左闭右开是二分查找“最不容易出错”的写法**，适合处理边界插入、重复元素等问题。
