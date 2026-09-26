---
title: volatile 能保证线程安全吗？
category: java
description: 分清可见性与原子性，理解 volatile 的能力和使用边界。
tags: Java 并发,内存模型
date: 2026-09-25
---

## 可见性解决什么问题

多个线程共享状态时，一个线程完成修改，另一个线程需要按明确的规则观察到变化。对同一个 volatile 字段的写入，与后续读取建立 happens-before 关系。

通过这条关系，写入线程在该写操作之前完成的其他数据修改，也能对读取线程后续操作可见。

## 一次读写与一组操作

volatile 字段的单次读写具有原子性，但 `count++` 包含读取、加一、写回三个步骤。两个线程可能都读到 5，各自写回 6，最终少计一次。

每一步都读写完整的值，依然无法保证三个步骤整体不可分割。**可见性与复合操作的原子性，是两项不同的要求。**

```java
// 多线程共享计数器的一种实现
AtomicInteger count = new AtomicInteger();
count.incrementAndGet();
```

## 根据共享状态选择工具

单个停止标志可以使用 volatile，让工作线程在下次检查标志时观察到停止请求。共享计数器可以使用 AtomicInteger 的原子自增操作。

如果操作需要同时维护集合内容和独立计数等多个状态，应设计统一的同步边界，例如让相关访问都受同一把锁保护。

## 引用的保证有边界

把一个 List 引用声明为 volatile，保证的是引用的读写语义，并不会让 `list.add` 自动成为线程安全操作。若多个线程还会修改列表内容，需要合适的并发容器或同步措施。

排查时可以分别确认：共享的是什么、一次操作包含几步、哪些状态必须一起改变。

## 延伸阅读

- [Java 语言规范：线程与锁](https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html)
- [AtomicInteger 官方文档](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/atomic/AtomicInteger.html)
