import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function validateDeployHook(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error('请在仓库 Secret VERCEL_DEPLOY_HOOK 中保存有效的部署 Hook。'); }
  if (
    url.protocol !== 'https:' || url.hostname !== 'api.vercel.com' ||
    url.port || url.username || url.password || url.search || url.hash ||
    !/^\/v1\/integrations\/deploy\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+$/.test(url.pathname)
  ) {
    throw new Error('部署 Hook 格式不正确：须使用 Vercel 生成的 HTTPS 地址，且不含额外参数。');
  }
  return url;
}

export async function requestDeployHook(value, fetchRequest = fetch) {
  const url = validateDeployHook(value);
  let response;
  try {
    response = await fetchRequest(url, {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    // Fetch errors can contain the secret URL; emit a fixed message instead.
    throw new Error('部署请求未确认：连接失败、请求超时或服务返回重定向。请先查看 Vercel 部署记录，再决定是否重试。');
  }
  if (!response.ok) {
    throw new Error(`部署请求未被接受（HTTP ${response.status}）。请检查 Vercel 项目和部署 Hook 设置。`);
  }
  // The Hook queues a job. An accepted request does not establish a successful deployment.
  console.log('Vercel 已接受部署请求；构建和发布结果请到 Vercel 控制台查看。');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await requestDeployHook(process.env.VERCEL_DEPLOY_HOOK);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
