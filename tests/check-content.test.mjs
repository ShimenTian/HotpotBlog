import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { validateContent } from '../scripts/check-content.mjs';

function articleFixture(t, body) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hotpot-content-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'content'));
  fs.writeFileSync(path.join(root, 'content', 'tutorial.md'), `---
title: 建站教程
category: practice
description: 演示 Markdown 图片语法。
tags: Markdown,图片
date: 2026-09-26
---
${body}
`);
  return root;
}

test('代码块中的图片示例无需对应文件，正文中的真实图片仍会检查', t => {
  const root = articleFixture(t, [
    '## 图片用法',
    '```markdown',
    '![示例](/images/example.webp)',
    '```',
    '![实际配图](/images/real.webp)',
  ].join('\n'));

  assert.throws(() => validateContent(root), error =>
    error.message.includes('/images/real.webp') && !error.message.includes('/images/example.webp'));
  fs.mkdirSync(path.join(root, 'images'));
  fs.writeFileSync(path.join(root, 'images', 'real.webp'), 'image fixture');
  assert.deepEqual(validateContent(root), { articleCount: 1 });
});

test('检查多个代码块前后的正文图片', t => {
  const root = articleFixture(t, [
    '![前图](/images/before.webp)',
    '```markdown',
    '![示例一](/images/example-one.webp)',
    '```',
    '正常段落。',
    '```text',
    '![示例二](/images/example-two.webp)',
    '```',
    '![后图](/images/after.webp)',
  ].join('\n'));

  assert.throws(() => validateContent(root), error =>
    error.message.includes('/images/before.webp') &&
    error.message.includes('/images/after.webp') &&
    !error.message.includes('/images/example-'));
});
