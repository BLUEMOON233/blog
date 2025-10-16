---
title: CSS Grid 布局完全指南
date: 2025-09-08
category: 前端开发
tags:
  - CSS
  - 布局
  - Grid
description: 全面介绍 CSS Grid 布局系统，从基础到进阶应用。
---

# CSS Grid 布局完全指南

## 什么是 Grid 布局

CSS Grid 是一个二维布局系统，能够同时处理行和列。

## 基础概念

### 网格容器

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 100px 200px;
  gap: 10px;
}
```

### 网格项

```css
.item {
  grid-column: 1 / 3;
  grid-row: 1 / 2;
}
```

## 常用属性

- `grid-template-columns/rows`
- `grid-gap`
- `justify-items`
- `align-items`

## 实战案例

使用 Grid 布局实现响应式网页设计。

## 总结

Grid 布局提供了强大而灵活的二维布局能力，是现代 CSS 的重要特性。
