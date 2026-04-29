---
title: "力扣刷题技巧"
date: 2026-04-29
tag: "sort"
---

> Produced by DeepSeek

在 Java 中刷 LeetCode，掌握以下高频技巧可以显著提升编码效率。我将它们分为四大块：排序、类型转换、高级数据结构初始化、以及其他实用操作。

## 一、排序技巧

### 1. 数组排序
```java
int[] arr = {3, 1, 4};
Arrays.sort(arr);                 // 升序 [1,3,4]
Arrays.sort(arr, 1, 3);           // 部分排序 [索引1到3)
// 降序：需要包装类型
Integer[] boxed = {3,1,4};
Arrays.sort(boxed, (a,b)->b-a);   // 或 Comparator.reverseOrder()
```

### 2. List排序
```java
List<Integer> list = Arrays.asList(3,1,4);
Collections.sort(list);                          // 升序
list.sort((a,b)->a-b);                           // 同上
list.sort(Comparator.reverseOrder());            // 降序
list.sort((a,b)->b-a);
```

### 3. 自定义对象排序
```java
// 按属性升序
Arrays.sort(persons, Comparator.comparing(Person::getAge));
// 多级排序：年龄升序，分数降序
Arrays.sort(persons, Comparator.comparing(Person::getAge)
                               .thenComparing(Person::getScore, Comparator.reverseOrder()));
// 注意：自定义比较器时，升序返回 o1 - o2，降序反之
```

### 4. 使用 lambda 快速实现 Comparator
```java
// 按字符串长度排序
Arrays.sort(strs, (s1,s2) -> s1.length() - s2.length());
// 安全写法（防止溢出）
Arrays.sort(strs, Comparator.comparingInt(String::length));
```

## 二、类型转换

### 1. List <-> 数组

**List 转 int[]**（最常用，不需循环）：
```java
List<Integer> list = new ArrayList<>(Arrays.asList(1,2,3));
// Java 8+
int[] arr = list.stream().mapToInt(i->i).toArray();
// 或使用 IntStream
int[] arr = list.stream().mapToInt(Integer::intValue).toArray();
```

**List 转 Integer[]**：
```java
Integer[] boxed = list.toArray(new Integer[0]);
```

**int[] 转 List<Integer>**：
```java
int[] arr = {1,2,3};
List<Integer> list = Arrays.stream(arr).boxed().collect(Collectors.toList());
```

**String[] 转 List<String>**：
```java
List<String> list = Arrays.asList(strArray);  // 固定长度
List<String> list = new ArrayList<>(Arrays.asList(strArray)); // 可变
```

### 2. Set <-> List / 数组

**Set 转 List**：
```java
Set<Integer> set = new HashSet<>(Arrays.asList(1,2,3));
List<Integer> list = new ArrayList<>(set);
```

**Set 转 int[]**：
```java
int[] arr = set.stream().mapToInt(i->i).toArray();
```

**List 转 Set**：
```java
Set<Integer> set = new HashSet<>(list);
```

### 3. Map 的键/值转数组

```java
Map<String, Integer> map = new HashMap<>();
// Key 集合转数组
String[] keys = map.keySet().toArray(new String[0]);
Integer[] values = map.values().toArray(new Integer[0]);
// 转 int[]（需要 stream）
int[] intValues = map.values().stream().mapToInt(i->i).toArray();
```

### 4. 字符与字符串互转

```java
String s = "hello";
char[] chars = s.toCharArray();               // 最常用
List<Character> list = s.chars().mapToObj(c->(char)c).collect(Collectors.toList());
// char[] 转 String
String str = new String(chars);
```

## 三、高级数据结构初始化

### 1. 栈（Stack）
```java
Deque<Integer> stack = new ArrayDeque<>();   // 推荐，比 Stack 快
stack.push(1);
int top = stack.pop();
int peek = stack.peek();
```

### 2. 双端队列（Deque）
```java
Deque<Integer> deque = new ArrayDeque<>();
// 当作队列使用
deque.offer(1);        // 尾部添加
int front = deque.poll();   // 头部弹出
// 双端操作
deque.offerFirst(0);
deque.offerLast(2);
```

### 3. 优先队列（堆）
```java
// 最小堆（默认）
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
// 最大堆
PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a,b)->b-a);
// 或 Comparator.reverseOrder()
// 自定义对象堆（按 score 最小）
PriorityQueue<Node> heap = new PriorityQueue<>(Comparator.comparingInt(n -> n.score));
// 初始化时直接传入集合
PriorityQueue<Integer> heap = new PriorityQueue<>(list);
```

### 4. 单调栈常用套路
```java
Deque<Integer> stack = new ArrayDeque<>();
for (int i = 0; i < n; i++) {
    // 维护单调递增栈：弹出比当前大的元素
    while (!stack.isEmpty() && stack.peek() > nums[i]) {
        // 处理栈顶
        stack.pop();
    }
    stack.push(nums[i]);
}
```

### 5. 快速创建 List/Set/Map
```java
// 固定长度 List
List<Integer> list = Arrays.asList(1,2,3);
// 可变 List
List<Integer> list = new ArrayList<>(Arrays.asList(1,2,3));
// 初始化 Set
Set<String> set = new HashSet<>(Arrays.asList("a","b"));
// 初始化 Map（最多10个键值对，Java 9+）
Map<String, Integer> map = Map.of("k1",1, "k2",2);  // 不可变
Map<String, Integer> mutable = new HashMap<>(Map.of("k1",1, "k2",2));
// 传统方式
Map<String, Integer> map = new HashMap<String, Integer>() {{
    put("a",1);
    put("b",2);
}};
```

## 四、其他实用技巧

### 1. 数组拷贝
```java
int[] copy = Arrays.copyOf(arr, arr.length);       // 完整拷贝
int[] part = Arrays.copyOfRange(arr, 1, 4);        // 索引1~3
int[] copy = arr.clone();                          // 一维数组可用
// 二维数组深拷贝：需要循环或流
```

### 2. 数组填充
```java
int[] arr = new int[10];
Arrays.fill(arr, -1);                   // 全部填充-1
Arrays.fill(arr, 2, 5, 0);              // 索引2~4填0
```

### 3. 字符串常用操作
```java
// 剔除首尾空格
String trimmed = s.trim();
// 分割字符串（注意转义）
String[] parts = s.split(",");
// 字符串拼接（数组/List）
String joined = String.join("-", list);   // 列表元素用-连接
String joined = String.join(",", arr);    // 数组也行（需变参）
// 字符重复（Java 11+）
String bar = "=".repeat(10);
```

### 4. 常用集合快速判空与取值
```java
// 获取 list 最后一个元素
int last = list.get(list.size()-1);
// 安全获取 map 值，不存在返回默认
int val = map.getOrDefault(key, 0);
// 计算并更新
map.put(key, map.getOrDefault(key, 0) + 1);
```

### 5. 数组与列表逆序
```java
// 数组逆序（自己写循环或用 Collections 辅助）
List<Integer> list = Arrays.asList(1,2,3);
Collections.reverse(list);
// 对 int[] 逆序需要先转 List 或手写循环
```

### 6. 两数/三数之和排序双指针模板
```java
Arrays.sort(arr);
int left = 0, right = n-1;
while (left < right) {
    int sum = arr[left] + arr[right];
    if (sum == target) {...}
    else if (sum < target) left++;
    else right--;
}
```

### 7. 快速打印调试
```java
System.out.println(Arrays.toString(arr));
System.out.println(list);
System.out.println(Arrays.deepToString(2Darray));
```
	
## Map 相关的高级技巧

### 一、Map 的初始化技巧

```java
// 1. 不可变单对（Java 9+）
Map<String, Integer> map = Map.of("a", 1);  // 最多10个键值对

// 2. 不可变多对
Map<String, Integer> map = Map.of("a", 1, "b", 2, "c", 3);

// 3. 使用 Map.ofEntries（无数量限制）
Map<String, Integer> map = Map.ofEntries(
    Map.entry("a", 1),
    Map.entry("b", 2)
);

// 4. 可变 Map（双括号初始化，注意内存泄漏风险，仅刷题可用）
Map<String, Integer> map = new HashMap<String, Integer>() {{
    put("a", 1);
    put("b", 2);
}};

// 5. 从另一个 Map 拷贝
Map<String, Integer> newMap = new HashMap<>(oldMap);
```

### 二、Map 遍历与迭代

```java
Map<String, Integer> map = new HashMap<>();

// 1. 遍历键值对（最常用）
for (Map.Entry<String, Integer> entry : map.entrySet()) {
    String key = entry.getKey();
    int value = entry.getValue();
}

// 2. Java 8 Lambda
map.forEach((key, value) -> System.out.println(key + ":" + value));

// 3. 遍历所有键
for (String key : map.keySet()) { }

// 4. 遍历所有值
for (int value : map.values()) { }  // 注意：values() 返回 Collection<Integer>
```

### 三、常用方法速查

```java
// 安全获取值，不存在返回默认值
int val = map.getOrDefault(key, 0);

// 如果 key 不存在则计算并放入，返回计算值（线程安全但刷题很少用）
map.computeIfAbsent(key, k -> new ArrayList<>()).add(value);

// 更新存在的键的值，不存在则不操作
map.computeIfPresent(key, (k, v) -> v + 1);

// 通用的 compute：无论存在与否都计算
map.compute(key, (k, v) -> (v == null) ? 1 : v + 1);

// 合并：如果 key 不存在则放入 defaultValue，否则用 remappingFunction 合并
map.merge(key, 1, Integer::sum);   // 计数常用

// 如果 key 不存在则放入，返回旧值或 null
map.putIfAbsent(key, 1);

// 替换（仅当 key 存在且当前 value 等于 oldValue 时）
map.replace(key, oldVal, newVal);
```

### 四、计数场景最佳实践

```java
// 方法1：getOrDefault + put
map.put(key, map.getOrDefault(key, 0) + 1);

// 方法2：merge（最简洁）
map.merge(key, 1, Integer::sum);

// 方法3：compute
map.compute(key, (k, v) -> (v == null) ? 1 : v + 1);

// 方法4：传统判断
int cnt = map.getOrDefault(key, 0);
map.put(key, cnt + 1);
```

### 五、Map 与 List/Set 转换

```java
// 1. Map 的 key 集合转 List
List<String> keyList = new ArrayList<>(map.keySet());

// 2. Map 的 value 集合转 List
List<Integer> valueList = new ArrayList<>(map.values());

// 3. Map 的 key 集合转 Set（本身就是 Set）
Set<String> keySet = map.keySet();  // 注意：这个 Set 受 map 影响，修改会同步

// 4. Map 转 List<Entry>
List<Map.Entry<String, Integer>> entries = new ArrayList<>(map.entrySet());

// 5. 根据 Map 构建新的 List（例如提取某些属性）
List<String> result = map.entrySet().stream()
    .filter(e -> e.getValue() > 0)
    .map(Map.Entry::getKey)
    .collect(Collectors.toList());
```

### 六、Map 排序

```java
// 1. 按 key 排序（TreeMap 自动排序）
Map<String, Integer> sortedByKey = new TreeMap<>(map);

// 2. 临时按 key 排序（得到 List 或 LinkedHashMap）
map.entrySet().stream()
   .sorted(Map.Entry.comparingByKey())
   .collect(Collectors.toMap(
       Map.Entry::getKey, 
       Map.Entry::getValue,
       (e1, e2) -> e1,   // 解决冲突
       LinkedHashMap::new
   ));

// 3. 按 value 排序（最常用）
List<Map.Entry<String, Integer>> list = new ArrayList<>(map.entrySet());
list.sort(Map.Entry.comparingByValue());                 // 升序
list.sort(Map.Entry.comparingByValue(Comparator.reverseOrder())); // 降序

// 4. 按 value 排序后取前 K 个
List<String> topK = map.entrySet().stream()
    .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
    .limit(k)
    .map(Map.Entry::getKey)
    .collect(Collectors.toList());
```

### 七、数组 / List 转 Map

```java
// 1. 两个数组转 Map（key 数组，value 数组）
String[] keys = {"a","b"};
Integer[] vals = {1,2};
Map<String, Integer> map = IntStream.range(0, keys.length)
    .boxed()
    .collect(Collectors.toMap(i -> keys[i], i -> vals[i]));

// 2. List<Person> 按 id 作为 key 转 Map
Map<Integer, Person> personMap = persons.stream()
    .collect(Collectors.toMap(Person::getId, Function.identity()));

// 3. 处理重复 key（例如取第一个或合并）
Map<Integer, Person> map = persons.stream()
    .collect(Collectors.toMap(Person::getId, Function.identity(), (old, newVal) -> old));

// 4. 按某个属性分组（List 转 Map<Integer, List<Person>>）
Map<Integer, List<Person>> groupByAge = persons.stream()
    .collect(Collectors.groupingBy(Person::getAge));
```

### 八、其他实用技巧

```java
// 判断两个 Map 相等（比较键值对）
boolean equal = map1.equals(map2);  // 注意：顺序不影响，但需要值也 equal

// 清空 Map
map.clear();

// 从 Map 中移除条件
map.entrySet().removeIf(entry -> entry.getValue() == 0);

// 只保留指定 key 集合中的项（若修改原 Map）
map.keySet().retainAll(keysToKeep);

// 合并两个 Map（若有相同 key，值相加）
map2.forEach((k, v) -> map1.merge(k, v, Integer::sum));

// 获取最大 value 对应的 key
String maxKey = map.entrySet().stream()
    .max(Map.Entry.comparingByValue())
    .map(Map.Entry::getKey)
    .orElse(null);
```

### 九、频率统计的快速写法

```java
// 统计字符频率
String s = "leetcode";
Map<Character, Integer> freq = new HashMap<>();
for (char c : s.toCharArray()) {
    freq.merge(c, 1, Integer::sum);
}

// 统计单词频率
String[] words = {"apple","banana","apple"};
Map<String, Integer> map = new HashMap<>();
for (String w : words) map.merge(w, 1, Integer::sum);
```

### 十、注意点

- `map.keySet()` 返回的 Set 受原 Map 影响，若修改（如删除）会同步到 Map，但**不能直接 add**。
- `map.values()` 同理，修改会影响原 Map。
- 对 `map.entrySet()` 迭代时，不能直接 `remove()`（会抛异常），需要使用迭代器的 `remove()` 或 `removeIf`。
- 使用 `HashMap` 时，如果已知大概容量，指定初始容量可以避免频繁 rehash，如 `new HashMap<>(n*2)`。

掌握这些 Map 技巧，刷题时处理频率、分组、缓存、排序等场景将非常顺手。

## 总结建议
- 优先使用 `Deque<Integer> stack = new ArrayDeque<>();` 而不是 `Stack`。
- 排序比较器 `(a,b)->a-b` 只在确信不会溢出时使用；通用写法用 `Integer.compare(a,b)` 或 `Comparator`.
- 转换 `int[]` 和 `List<Integer>` 时，流式操作简洁但微量性能损失，可以接受。
- 初始化常用 `Arrays.asList(...)` 配合 `new ArrayList<>` 得到可变列表。
