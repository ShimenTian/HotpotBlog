import assert from 'node:assert/strict';
import test from 'node:test';
import { requestSiteDeployment } from '../scripts/request-deploy.mjs';

test('dispatches only the private website main workflow', async () => {
  await requestSiteDeployment('test-token', async (url, options) => {
    assert.equal(url, 'https://api.github.com/repos/ShimenTian/hotpot-coding-site/actions/workflows/build.yml/dispatches');
    assert.equal(options.redirect, 'error');
    assert.equal(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), { ref: 'main' });
    assert.equal(options.headers.Authorization, 'Bearer test-token');
    return { ok: true, status: 204 };
  });
});

test('missing token and denied dispatch fail the job', async () => {
  await assert.rejects(requestSiteDeployment(''), /SITE_DISPATCH_TOKEN/);
  await assert.rejects(requestSiteDeployment('test-token', async () => ({ ok: false, status: 403 })), /HTTP 403/);
});

test('network errors never echo the credential', async () => {
  await assert.rejects(requestSiteDeployment('test-secret', async () => { throw new Error('test-secret'); }), error => !error.message.includes('test-secret'));
});
