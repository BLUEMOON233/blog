---
title: 深入理解 JavaScript 闭包
date: 2025-09-10
category: 编程语言
tags:
  - JavaScript
  - 闭包
  - 函数式编程
description: 详细讲解 JavaScript 闭包的原理、应用场景和常见陷阱。
---

# 深入理解 JavaScript 闭包

## 什么是闭包

闭包是指函数能够访问其词法作用域外的变量，即使函数在其词法作用域外执行。

## 闭包的形成

```javascript
function outer() {
  const message = 'Hello'

  function inner() {
    console.log(message) // 访问外部变量
  }

  return inner
}

const fn = outer()
fn() // 输出: Hello
```

## 应用场景

1. **数据私有化**
2. **函数工厂**
3. **回调函数**
4. **模块模式**

## 常见陷阱

### 循环中的闭包

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// 输出: 3 3 3
```

解决方案：使用 `let` 或 IIFE。

## 总结

闭包是 JavaScript 的核心概念，理解闭包对于编写高质量代码至关重要。
