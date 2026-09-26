---
title: HashMap 是如何存储数据的？
category: java
description: 从数组、链表到红黑树，沿着一次 put 操作，理解 HashMap 的内部结构。
tags: 集合,数据结构
date: 2026-09-25
---

## 从一个问题开始

我们用 `map.put(key, value)` 存入数据，再用 `map.get(key)` 取出数据。HashMap 如何知道一个键应该放在哪里？

可以先把 HashMap 理解为一个**由数组组织起来的桶集合**。键经过哈希计算后，会映射到某个数组下标；当不同的键落在同一个桶里时，就需要在桶内进一步区分它们。

## 数组、链表与红黑树

在常见的 OpenJDK 8 及后续实现中，HashMap 使用数组，并在发生哈希冲突时使用链表或红黑树组织桶内节点。

:::diagram hashmap
:::

数组帮助我们快速找到桶，桶内结构帮助我们找到具体的键。计算出相同的桶下标，并不代表两个键相等；比较时还需要检查哈希值与键的相等性。

## 一次 put 的过程

1. 根据键的哈希值计算扰动后的哈希值。
2. 用数组长度和哈希值确定桶下标。
3. 如果桶为空，直接放入新节点。
4. 如果桶里已经有节点，检查是否存在相等的键；存在则替换值，否则插入新节点。
5. 根据桶内节点数量和数组容量，判断是否需要树化或扩容。

```java
Map<String, Integer> scores = new HashMap<>();
scores.put("Java", 90);
scores.put("MySQL", 85);
scores.put("Java", 95); // 相同的键，替换旧值
System.out.println(scores.get("Java")); // 95
```

## 扩容解决了什么问题

随着元素增加，桶里的冲突通常会增多。扩容会增加数组容量，并重新分配节点所在的桶。常见实现的默认负载因子是 `0.75`，超过相应阈值时会触发扩容。

扩容需要迁移已有节点，因此已知预计元素数量时，可以合理选择初始容量，减少扩容次数。初始容量也不宜远大于实际需求，避免额外的内存占用和遍历成本。

> 链表变成红黑树还受到数组容量等条件约束。常见实现中的树化阈值是 8、最小树化容量是 64；这些是实现细节，不是 Map 接口的通用约定。

## 使用时的边界

HashMap 不保证遍历顺序，也不是线程安全的容器。在多个线程中共享并修改映射时，需要根据场景使用同步机制或并发容器。

作为键的对象，其 `equals` 与 `hashCode` 应保持一致。在对象作为键存入之后，修改参与这两个方法计算的字段，可能导致后续查找失败。

## 小结

理解 HashMap，可以沿着**算哈希、定位桶、比较键、必要时扩容**这条顺序推演。数组与桶内结构各司其职，共同完成键值对的存储与查找。

## 延伸阅读

- [Java HashMap 官方文档](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html)
- [OpenJDK HashMap 源码](https://github.com/openjdk/jdk/blob/master/src/java.base/share/classes/java/util/HashMap.java)
