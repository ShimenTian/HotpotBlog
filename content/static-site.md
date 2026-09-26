---
title: 一个静态知识站，是怎样发布上线的？
category: practice
description: 从 Markdown 到浏览器，理解构建、托管与访问路径之间的关系。
tags: 网站部署,静态网站
date: 2026-09-25
---

## 先确认交付的文件

静态网站发布的是浏览器可以读取的 HTML、CSS、JavaScript 和图片等文件。文章可以先写成 Markdown，再由构建工具生成页面。

“静态”描述的是页面交付方式，页面依然可以通过 JavaScript 实现搜索、目录折叠等交互。

```text
Markdown 文章 + 页面模板
        ↓ 构建
HTML / CSS / JavaScript / 图片
        ↓ 部署
静态托管平台 → 读者的浏览器
```

## 选择明确的发布来源

以 GitHub Pages 为例，可以指定某个分支的根目录或 docs 目录作为来源，也可以使用 GitHub Actions 完成构建和发布。

如果项目需要专门的构建步骤，工作流能把安装依赖、生成页面和部署串起来，减少手动搬运文件。

## 检查入口与访问路径

发布目录需要包含站点入口，最直接的形式是 index.html。项目站点的默认地址通常带有仓库名，因此图片、样式和文章链接都应适配这个路径。

首页显示正常之后，还应打开一篇文章，再刷新页面，确认链接可以独立访问。

## 发布后完成一次走查

部署完成后，用公开地址检查导航、图片和移动端排版，并查看构建记录中是否出现错误。后续更新可以继续通过提交触发发布。

静态托管负责提供生成后的文件；登录、数据写入等能力需要结合实际需求接入相应服务。

## 延伸阅读

- [GitHub Pages：配置发布来源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
