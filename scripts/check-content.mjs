import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const categories = new Set(['java', 'mysql', 'redis', 'network', 'os', 'practice']);
const required = ['title', 'category', 'description', 'tags', 'date'];
const allowed = new Set([...required, 'sample']);

export function validateContent(contentRoot = root) {
  const directory = path.join(contentRoot, 'content');
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const errors = [];
  let articleCount = 0;

  for (const entry of entries) {
    const file = entry.name;
    const fail = message => errors.push(`${file}: ${message}`);
    if (!entry.isFile() || !/^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(file)) {
      fail('文章须直接放在 content/，文件名使用小写英文字母、数字和单个连字符，以 .md 结尾。');
      continue;
    }
    articleCount++;
    const raw = fs.readFileSync(path.join(directory, file), 'utf8').replace(/\r\n/g, '\n');
    const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) {
      fail('缺少以 --- 包围的文章信息，或信息格式不正确。');
      continue;
    }
    const [, front, body] = match;
    const meta = Object.create(null);
    for (const line of front.split('\n')) {
      const field = line.match(/^([a-z]+):\s*(.*)$/);
      if (!field) {
        fail('文章信息须每行填写一个 key: value，暂不支持多行 YAML。');
        continue;
      }
      const [, key, value] = field;
      if (!allowed.has(key)) fail(`不支持信息字段 ${key}。`);
      if (Object.hasOwn(meta, key)) fail(`信息字段 ${key} 重复。`);
      meta[key] = value.trim();
    }
    for (const key of required) {
      if (!meta[key]) fail(`缺少必填信息 ${key}。`);
    }
    if (meta.category && !categories.has(meta.category)) {
      fail(`category 须为 ${[...categories].join('、')} 之一。`);
    }
    if (meta.date) {
      const date = new Date(`${meta.date}T00:00:00.000Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== meta.date) {
        fail('date 须为有效日期，格式为 YYYY-MM-DD。');
      }
    }
    if (meta.tags && meta.tags.split(',').some(tag => !tag.trim())) {
      fail('tags 使用英文逗号分隔，每个标签都需要填写内容。');
    }
    if (Object.hasOwn(meta, 'sample') && !['true', 'false'].includes(meta.sample)) {
      fail('sample 只能填写 true 或 false。');
    }
    if (!body.trim()) fail('文章正文不能为空。');

    // The site treats any line starting with ``` as an opening/closing fence.
    // Markdown examples inside those fences are displayed as code, not images.
    let inCodeBlock = false;
    const renderedBody = body.trim().split('\n').filter(line => {
      if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        return false;
      }
      return !inCodeBlock;
    }).join('\n');

    // Only local image references are checked; validation makes no external requests.
    for (const image of renderedBody.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
      const source = image[1];
      if (/^https?:\/\//.test(source)) continue;
      if (!/^\/images\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:png|jpe?g|gif|webp|avif|svg)$/.test(source)) {
        fail('本地图片请使用 /images/name.webp 等绝对路径，路径使用英文字母、数字、连字符或下划线。');
        continue;
      }
      const segments = source.slice(1).split('/');
      let target = contentRoot;
      for (const [index, segment] of segments.entries()) {
        target = path.join(target, segment);
        let stat;
        try { stat = fs.lstatSync(target); } catch { fail(`图片不存在：${source}`); break; }
        const expectedType = index === segments.length - 1 ? stat.isFile() : stat.isDirectory();
        if (stat.isSymbolicLink() || !expectedType) {
          fail(`图片路径须使用普通文件及目录：${source}`);
          break;
        }
      }
    }
  }
  if (articleCount === 0) errors.push('content/ 中至少需要一篇文章。');
  if (errors.length) throw new Error(errors.join('\n'));
  return { articleCount };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = validateContent();
    console.log(`内容检查通过：${result.articleCount} 篇文章。`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
