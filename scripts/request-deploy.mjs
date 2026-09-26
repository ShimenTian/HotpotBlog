import path from 'node:path';
import { fileURLToPath } from 'node:url';

const endpoint = 'https://api.github.com/repos/ShimenTian/hotpot-coding-site/actions/workflows/build.yml/dispatches';

export async function requestSiteDeployment(token, fetchRequest = fetch) {
  if (!token?.trim()) throw new Error('请在仓库 Secret SITE_DISPATCH_TOKEN 中配置网站仓库的 Actions 令牌。');
  let response;
  try {
    response = await fetchRequest(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token.trim()}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ ref: 'main' }),
      redirect: 'error',
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    // Never include a request object or credential in errors.
    throw new Error('发布请求未确认：连接失败或超时，请先检查网站仓库 Actions 记录。');
  }
  if (!response.ok) throw new Error(`GitHub 未接受发布请求（HTTP ${response.status}），请检查令牌有效期及网站仓库的 Actions 写入权限。`);
  console.log('网站发布任务已触发：https://github.com/ShimenTian/hotpot-coding-site/actions');
  console.log('请求成功表示已触发任务；实际发布结果请查看网站仓库 Actions。');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await requestSiteDeployment(process.env.SITE_DISPATCH_TOKEN);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
