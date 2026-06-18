#!/usr/bin/env node
// mycelium-for-dalux — Dalux Field/Build BCF topics → Connective Spine records.
// Join key: ifcGuid (resolved from BCF viewpoint components or Revit UniqueId).
// Auth: OAuth2 bearer (client-credentials or pre-obtained token via DALUX_TOKEN).
// Confidence: 'live' — topics are observed on site.
import { runAdapter, deriveIfcGuid, append } from './vendor/mycelium-sdk.mjs';
import { makeBcfApiFetch, BCF_PRESETS }       from './vendor/bcf-api.mjs';

const preset = BCF_PRESETS.dalux;

const config = {
  source: 'dalux',
  identity: {
    uniqueId:     'bcf:{localId}',
    projectKey:   '{project}',
    localIdField: 'localId',
  },
  freshness: {
    revisionId: '{modified}',
    asOf:       '{modified}',
    confidence: 'live',
  },
};

// ── OAuth2 ────────────────────────────────────────────────────────────────────
// Token cache: reuse until expiry minus a 60-second buffer.
let _tokenCache = null;

async function getAccessToken(env) {
  if (env.DALUX_TOKEN) return env.DALUX_TOKEN;   // bypass: pre-obtained token

  const now = Date.now();
  if (_tokenCache && _tokenCache.expiresAt > now) return _tokenCache.token;

  const res = await fetch(env.DALUX_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     env.DALUX_CLIENT_ID,
      client_secret: env.DALUX_CLIENT_SECRET,
      scope:         env.DALUX_SCOPE ?? '',
    }),
  });
  if (!res.ok) throw new Error(`Dalux OAuth ${res.status} ${res.statusText}`);
  const json = await res.json();
  _tokenCache = {
    token:     json.access_token,
    expiresAt: now + (json.expires_in ?? 3600) * 1000 - 60_000,
  };
  return _tokenCache.token;
}

// ── read path ─────────────────────────────────────────────────────────────────
export async function run(env = process.env) {
  const token      = await getAccessToken(env);
  const fetchSource = makeBcfApiFetch({
    baseUrl:      preset.baseUrl,
    token,
    projectId:    env.DALUX_PROJECT_ID,
    projectKey:   env.DALUX_PROJECT_KEY,
    deriveIfcGuid,
  });
  return runAdapter(config, { fetchSource });
}

// ── write-back path ───────────────────────────────────────────────────────────
// Set a topic's status in Dalux and record propose→execute provenance.
// actor / approvedBy must be pseudonymous refs (human: / agent: / service: / did:).
export async function setTopicStatus({
  env = process.env,
  topicGuid,
  ifcGuid,
  before,
  after,
  actor,
  approvedBy = null,
  ledger = 'ledger.jsonl',
} = {}) {
  const token = await getAccessToken(env);

  // 1) log intent
  append(ledger, {
    source: 'dalux', action: 'set_topic_status', actor, approvedBy,
    targetKeys: { ifcGuid },
    before: { status: before }, after: { status: after },
    result: 'proposed',
  });

  // 2) execute — verify exact endpoint/body against Dalux BCF-API docs
  const res = await fetch(
    `${preset.baseUrl}/projects/${env.DALUX_PROJECT_ID}/topics/${topicGuid}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ topic_status: after }),
    },
  );

  // 3) record outcome
  append(ledger, {
    source: 'dalux', action: 'set_topic_status', actor, approvedBy,
    targetKeys: { ifcGuid },
    before: { status: before }, after: { status: after },
    result: res.ok ? 'executed' : 'failed',
  });

  if (!res.ok) throw new Error(`Dalux write-back ${res.status} ${res.statusText}`);
}

// ── CLI entry ─────────────────────────────────────────────────────────────────
if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await run();
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.conformant ? 0 : 1);
}
