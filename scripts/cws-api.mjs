const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const STORE_API_ROOT = 'https://chromewebstore.googleapis.com/v2';
const STORE_UPLOAD_ROOT = 'https://chromewebstore.googleapis.com/upload/v2';
const DEFAULT_REQUEST_TIMEOUT_MS = 60_000;
const SUCCESS_UPLOAD_STATES = new Set(['SUCCEEDED', 'SUCCESS']);
const PENDING_UPLOAD_STATES = new Set(['IN_PROGRESS', 'UPLOAD_IN_PROGRESS']);
const FAILED_UPLOAD_STATES = new Set(['FAILED', 'FAILURE', 'NOT_FOUND']);
const ACCEPTED_PUBLISH_STATES = new Set(['PENDING_REVIEW', 'PUBLISHED']);

function normalizedSecrets(secrets) {
  return [...new Set(secrets.filter(Boolean).map(String))].sort(
    (left, right) => right.length - left.length,
  );
}

function redact(value, secrets) {
  let result = String(value);
  for (const secret of normalizedSecrets(secrets)) result = result.replaceAll(secret, '***');
  return result;
}

function redactJson(value, secrets) {
  if (typeof value === 'string') return redact(value, secrets);
  if (Array.isArray(value)) return value.map((item) => redactJson(item, secrets));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [redact(key, secrets), redactJson(item, secrets)]),
    );
  }
  return value;
}

function validateTimeout(milliseconds, name) {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
    throw new Error(`${name} must be a positive number.`);
  }
}

async function requestJson({
  action,
  url,
  init,
  fetchImpl,
  secrets = [],
  signal,
  requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
}) {
  validateTimeout(requestTimeoutMs, 'requestTimeoutMs');
  const controller = new AbortController();
  let timer;
  let removeExternalAbort = () => {};

  const operation = (async () => {
    let response;
    try {
      response = await fetchImpl(url, { ...init, signal: controller.signal });
    } catch (error) {
      if (controller.signal.aborted) throw controller.signal.reason;
      throw new Error(`${action} failed: ${redact(error?.message ?? error, secrets)}`);
    }

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`${action} failed (HTTP ${response.status}): malformed JSON`);
    }

    if (!response.ok) {
      throw new Error(
        `${action} failed (HTTP ${response.status}): ${JSON.stringify(redactJson(data, secrets))}`,
      );
    }
    return data;
  })();

  const requestTimeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error(`${action} timed out after ${requestTimeoutMs}ms.`);
      controller.abort(error);
      reject(error);
    }, requestTimeoutMs);
  });
  const externalAbort = new Promise((_, reject) => {
    if (!signal) return;
    const abort = () => {
      const reason = signal.reason instanceof Error
        ? signal.reason
        : new Error(`${action} was aborted.`);
      controller.abort(reason);
      reject(reason);
    };
    if (signal.aborted) abort();
    else {
      signal.addEventListener('abort', abort, { once: true });
      removeExternalAbort = () => signal.removeEventListener('abort', abort);
    }
  });

  try {
    return await Promise.race([operation, requestTimeout, externalAbort]);
  } catch (error) {
    const message = redact(error?.message ?? error, secrets);
    throw new Error(message.startsWith(action) ? message : `${action} failed: ${message}`);
  } finally {
    clearTimeout(timer);
    removeExternalAbort();
  }
}

function itemUrl(root, publisherId, itemId, suffix = '') {
  return `${root}/publishers/${encodeURIComponent(publisherId)}/items/${encodeURIComponent(itemId)}${suffix}`;
}

function apiHeaders(accessToken, extra = {}) {
  return {
    authorization: `Bearer ${accessToken}`,
    ...extra,
  };
}

export async function exchangeRefreshToken({
  clientId,
  clientSecret,
  refreshToken,
  fetchImpl = fetch,
  signal,
  requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
}) {
  const secrets = [clientId, clientSecret, refreshToken];
  const data = await requestJson({
    action: 'Token exchange',
    url: TOKEN_URL,
    init: {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }).toString(),
    },
    fetchImpl,
    secrets,
    signal,
    requestTimeoutMs,
  });

  if (!data.access_token) throw new Error('Token exchange failed: missing access_token');
  return data.access_token;
}

export function uploadItem({
  publisherId,
  itemId,
  accessToken,
  zipBytes,
  fetchImpl = fetch,
  signal,
  requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
}) {
  return requestJson({
    action: 'Upload item',
    url: itemUrl(STORE_UPLOAD_ROOT, publisherId, itemId, ':upload'),
    init: {
      method: 'POST',
      headers: apiHeaders(accessToken, { 'content-type': 'application/zip' }),
      body: zipBytes,
    },
    fetchImpl,
    secrets: [accessToken],
    signal,
    requestTimeoutMs,
  });
}

export function getItemStatus({
  publisherId,
  itemId,
  accessToken,
  fetchImpl = fetch,
  signal,
  requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
}) {
  return requestJson({
    action: 'Get item status',
    url: itemUrl(STORE_API_ROOT, publisherId, itemId, ':fetchStatus'),
    init: {
      method: 'GET',
      headers: apiHeaders(accessToken),
    },
    fetchImpl,
    secrets: [accessToken],
    signal,
    requestTimeoutMs,
  });
}

function readUploadState(result) {
  if (!result || typeof result !== 'object' || Array.isArray(result)) return undefined;
  if (Object.hasOwn(result, 'uploadState')) return result.uploadState;
  if (Object.hasOwn(result, 'lastAsyncUploadState')) return result.lastAsyncUploadState;
  return undefined;
}

function inspectUploadState(result) {
  const state = readUploadState(result);
  if (!state) throw new Error('Upload response has missing state');
  if (SUCCESS_UPLOAD_STATES.has(state)) return 'success';
  if (PENDING_UPLOAD_STATES.has(state)) return 'pending';
  if (FAILED_UPLOAD_STATES.has(state)) {
    throw new Error(`Upload reached terminal state ${state}`);
  }
  throw new Error(`Upload response has unexpected state ${state}`);
}

function defaultSleep(milliseconds, { signal } = {}) {
  return new Promise((resolve, reject) => {
    const finish = (error) => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      if (error) reject(error);
      else resolve();
    };
    const timer = setTimeout(() => finish(), milliseconds);
    const abort = () => {
      finish(signal.reason instanceof Error ? signal.reason : new Error('Upload polling aborted.'));
    };
    if (!signal) return;
    if (signal.aborted) abort();
    else signal.addEventListener('abort', abort, { once: true });
  });
}

function publishOutcomeError(reason, data, accessToken) {
  const detail = redactJson(
    { state: data?.state, warningInfo: data?.warningInfo },
    [accessToken],
  );
  return new Error(`Publish item failed: ${reason} ${JSON.stringify(detail)}`);
}

export async function waitForUpload({
  publisherId,
  itemId,
  accessToken,
  initial,
  fetchImpl = fetch,
  sleep = defaultSleep,
  maxAttempts = 30,
  intervalMs = 5000,
  signal,
  requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
}) {
  let current = initial;
  if (inspectUploadState(current) === 'success') return current;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (signal?.aborted) throw signal.reason;
    await sleep(intervalMs, { signal });
    if (signal?.aborted) throw signal.reason;
    current = await getItemStatus({
      publisherId,
      itemId,
      accessToken,
      fetchImpl,
      signal,
      requestTimeoutMs,
    });
    if (inspectUploadState(current) === 'success') return current;
  }

  throw new Error(`Upload timed out after ${maxAttempts} status checks`);
}

export async function publishItem({
  publisherId,
  itemId,
  accessToken,
  fetchImpl = fetch,
  signal,
  requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
}) {
  const data = await requestJson({
    action: 'Publish item',
    url: itemUrl(STORE_API_ROOT, publisherId, itemId, ':publish'),
    init: {
      method: 'POST',
      headers: apiHeaders(accessToken, { 'content-type': 'application/json' }),
      body: JSON.stringify({ publishType: 'DEFAULT_PUBLISH' }),
    },
    fetchImpl,
    secrets: [accessToken],
    signal,
    requestTimeoutMs,
  });

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw publishOutcomeError('malformed response', data, accessToken);
  }
  if (!Object.hasOwn(data, 'state')) {
    throw publishOutcomeError('missing submission state', data, accessToken);
  }
  if (typeof data.state !== 'string' || data.state.length === 0) {
    throw publishOutcomeError('malformed submission state', data, accessToken);
  }
  if (!ACCEPTED_PUBLISH_STATES.has(data.state)) {
    throw publishOutcomeError('submission state', data, accessToken);
  }
  return data;
}
