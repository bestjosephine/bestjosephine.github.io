---
title: "二叉树"
date: 2026-05-01
tag: "leetcode"
---

我已经快30岁了，已经不想再管二叉树家的事了。

## 二叉树的遍历

### 1. 递归

前序遍历：根节点在前。遍历方式是根→左→右。
中序遍历：根节点在中。遍历方式是左→根→右。
后序遍历：根节点在后。遍历方式是左→右→根。

```java
/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode() {}
 *     TreeNode(int val) { this.val = val; }
 *     TreeNode(int val, TreeNode left, TreeNode right) {
 *         this.val = val;
 *         this.left = left;
 *         this.right = right;
 *     }
 * }
 */
 
public void traversal(TreeNode node) {
    // 边界条件处理
		if (node == null) return;
		// ⭐前序 root 节点
		// 递归左子节点
		traversal(node.left);
		// ⭐中序 root 节点
		// 递归右子节点
		traversal(node.right);
		// ⭐后序 root 节点
}
```

### 2. 迭代

迭代真的好难哦！

**前序遍历**：栈。将根节点push进去。循环中，取出栈最上边的节点，读取数字后再依次push右节点和左节点。
```java
public List<Integer> preorder(TreeNode root) {
    List<Integer> res = new ArrayList<>();
    if (root == null) return res;
    Deque<TreeNode> stack = new ArrayDeque<>();
    stack.push(root);
    while (!stack.isEmpty()) {
        TreeNode node = stack.pop();
        res.add(node.val);
        if (node.right != null) stack.push(node.right); // 先右后左，保证左先出
        if (node.left != null) stack.push(node.left);
    }
    return res;
}
```

**中序遍历**：栈+双循环。内循环-把节点存到栈中，直到节点不存在左节点。外循环-更新节点。
```java
public List<Integer> inorder(TreeNode root) {
    List<Integer> res = new ArrayList<>();
    Deque<TreeNode> stack = new ArrayDeque<>();
    TreeNode cur = root;
    while (cur != null || !stack.isEmpty()) {
        while (cur != null) {
            stack.push(cur);
            cur = cur.left;
        }
        cur = stack.pop();
        res.add(cur.val);
        cur = cur.right;
    }
    return res;
}
```

**后序遍历**：双栈法。后序遍历是前序遍历的反着来，即从栈的角度来看，是根→右→左。所以栈1就负责先遍历根节点，把根节点 push 进栈2。前序遍历想先打印左节点，需要先push右节点，再push左节点；后序遍历想先打印右节点，需要先push左节点，再push右节点。

```java
public List<Integer> postorder(TreeNode root) {
    List<Integer> res = new ArrayList<>();
    if (root == null) return res;
    Deque<TreeNode> s1 = new ArrayDeque<>();
    Deque<TreeNode> s2 = new ArrayDeque<>();
    s1.push(root);
    while (!s1.isEmpty()) {
        TreeNode node = s1.pop();
        s2.push(node);
				// 先push左节点，再push右节点
        if (node.left != null) s1.push(node.left);
        if (node.right != null) s1.push(node.right);
    }
    while (!s2.isEmpty()) {
        res.add(s2.pop().val);
    }
    return res;
}
```
