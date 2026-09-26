# Hotpot Coding · 文章仓库

这里存放 Hotpot Coding 的 Markdown 文章和配图。网站页面、样式、搜索与构建脚本在独立的私有仓库 `ShimenTian/hotpot-coding-site` 中维护；本仓库不包含网站外壳。

当前保留了 8 篇建站示例文章，文件内容和原始日期均未修改。示例用于展示阅读体验，后续可逐步替换为自己的文章。

## 目录

```text
content/                 Markdown 文章
images/                  文章配图
scripts/check-content.mjs 文章信息和本地图片检查
scripts/request-deploy.mjs 可选的部署请求脚本
.github/workflows/       内容检查及停用状态的自动发布配置
```

## 写一篇文章

在 `content/` 下创建文件，例如 `java-memory-model.md`。文件名会成为网站地址的一部分：`/articles/java-memory-model/`。使用小写英文字母、数字和单个连字符；文章直接放在 `content/`，目前不使用子目录。

文件开头填写文章信息，正文从二级标题开始：

```markdown
---
title: Java 内存模型解决了什么问题？
category: java
description: 从共享变量的读写，理解线程之间如何看见数据变化。
tags: Java 并发,内存模型
date: 2026-09-26
sample: false
---

## 从共享变量开始

在这里写正文。
```

`title`、`category`、`description`、`tags`、`date` 为必填项，每个字段占一行。值直接填写文本，无需加引号。`tags` 使用英文逗号分隔，`date` 使用真实日期，格式为 `YYYY-MM-DD`。

`sample` 可选：省略或填写 `true` 时，网站会标注“示例文章”；正式文章填写 `false`。

| category | 对应专栏 |
| --- | --- |
| `java` | Java 核心 |
| `mysql` | MySQL |
| `redis` | Redis |
| `network` | 计算机网络 |
| `os` | 操作系统 |
| `practice` | 开发实践 |

新增专栏时，需要同时修改本仓库的内容校验规则和私有网站仓库中的专栏配置。

## 图片与链接

将图片放入 `images/`，例如 `images/hashmap-structure.webp`，在正文中使用网站根路径：

```markdown
![HashMap 的数组和桶内节点](/images/hashmap-structure.webp)

[阅读 HashMap 文章](/articles/hashmap/)

[OpenJDK 文档](https://openjdk.org/)
```

图片文件及子目录名称使用英文字母、数字、连字符或下划线。支持 `.png`、`.jpg`、`.jpeg`、`.gif`、`.webp`、`.avif`、`.svg`。发布时，网站构建会把 `images/` 复制到站点的 `/images/`。GitHub 上阅读 Markdown 时，根路径图片未必能直接显示，以网站预览为准。

文章内链接使用 `/articles/文章文件名/`，例如 `/articles/hashmap/`；外部链接使用完整的 `https://` 地址。

## 当前支持的 Markdown

网站使用自有的轻量解析器，支持段落、二级与三级标题、加粗、行内代码、三个反引号包围的代码块、单层有序和无序列表、引用、简单表格、链接、图片和分隔线。标题目录由网站自动生成。

当前的 HashMap 示例还使用了内置的 `:::diagram hashmap` 图示块，该图示由私有网站代码绘制。其他自定义容器、Mermaid、数学公式、HTML 嵌入、复杂嵌套列表和完整 YAML 语法尚未实现。

## 提交前检查

本地安装 Node.js 22 或更新版本，在仓库目录运行：

```sh
node --test tests/*.test.mjs
node scripts/check-content.mjs
```

检查涵盖文章文件名、必填信息、分类、日期、示例标记和本地图片是否存在。网站完整构建与页面链接检查由私有网站仓库负责。

## 自动更新的准备情况

内容检查已配置：提交 Pull Request、向 `main` 推送更改或手动运行工作流，都会检查文章。

**自动发布目前未启用，现有线上网站仍由原来的托管方式维护。** 本仓库没有设置任何部署 Secret 或开关，本次拆分也不会迁移线上网站。

以后选择 Vercel 托管时，可以按以下顺序连接：

1. 将 Vercel 项目连接到私有网站仓库 `ShimenTian/hotpot-coding-site`，使用该仓库的构建配置。构建过程会读取本仓库 `main` 的最新文章与图片。
2. 在 Vercel 项目的 Git 设置中创建面向网站仓库 `main` 分支的 Deploy Hook。
3. 在本仓库的 **Settings → Secrets and variables → Actions → Secrets** 中创建 `VERCEL_DEPLOY_HOOK`，保存 Vercel 生成的完整 URL。该地址包含凭据，保存到 Secret 即可。
4. 准备发布时，在同一设置页的 **Variables** 中创建 `AUTO_DEPLOY`，值为 `true`。

启用后，本仓库 `main` 的推送或在 `main` 上手动运行工作流，会在内容检查通过后请求 Vercel 重新构建。Pull Request 始终只执行内容检查。部署请求被接受，仅表示任务已提交；构建是否成功以及是否上线，以 Vercel 控制台为准。

将 `AUTO_DEPLOY` 设为 `false` 或删除该变量，即可停用这里的自动发布请求。Vercel 对网站外壳仓库的自动部署另由 Vercel 项目设置管理。

工作流采用 [GitHub Actions](https://docs.github.com/en/actions)，部署请求遵循 [Vercel Deploy Hooks](https://vercel.com/docs/deploy-hooks)。

## 使用说明

本仓库公开用于阅读与维护文章，目前未单独声明内容及配图的授权许可，也未采用 MIT 等开源许可证。转载、改编或使用相关素材前，请联系作者确认许可。
