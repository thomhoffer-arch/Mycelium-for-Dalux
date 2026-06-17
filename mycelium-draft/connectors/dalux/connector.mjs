#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Mycelium-for-Dalux (v0.1 DRAFT) — Apache-2.0 (Mycelium open ecosystem; NOT Loam's proprietary license).
// Live REST connector: Dalux Field/Build issues -> Connective Spine.
// Dalux is a cloud REST source, auth = X-API-KEY header (no OAuth). Issues are
// BCF-style and carry element IFC GUIDs -> join key is ifcGuid.
// NOTE: endpoint/field names are best-effort vs the Dalux Build API — verify.
import { stamp, SPINE_VERSION } from '../../lib/spine-adapter.mjs';
import { checkConformance } from '../../conformance/validate.mjs';
import { append } from '../../lib/provenance.mjs';

const SOURCE  = 'dalux';
const BASE    = process.env.DALUX_URL || 'https://field.dalux.com/service/api/v1'; // verify
const API_KEY = process.env.DALUX_API_KEY || '';
const PROJECT = process.env.DALUX_PROJECT_ID || '';
const LEDGER  = process.env.MYC_LEDGER || './dalux.provenance.jsonl';

async function dalux(path, params = {}) {
  if (!API_KEY) throw new Error('DALUX_API_KEY required (X-API-KEY header)');
  const u = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params)) if (v != null) u.searchParams.set(k, v);
  const res = await fetch(u, { headers: { Accept: 'application/json', 'X-API-KEY': API_KEY } });
  if (!res.ok) throw new Error(`Dalux ${path} -> HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

// Pull issues/defects for the project (BCF-style; each points at an element GUID).
async function fetchSource() {
  const data = await dalux(`/projects/${PROJECT}/issues`, { limit: 200 });
  const items = data.items || data.data || data || [];
  return items.map((it) => ({
    id:        it.id ?? it.number ?? it.guid,
    projectKey: PROJECT,
    ifcGuid:   it.ifcGuid ?? it.elementGuid ?? it.bcf?.ifcGuid ?? null, // join edge
    title:     it.title ?? it.subject,
    status:    it.status ?? it.state,
    modified:  it.modifiedAt ?? it.updated ?? it.createdAt,
  }));
}

function toSpine(rec) {
  return {
    identity: {
      source: SOURCE,
      sourceLocalId: String(rec.id),
      projectKey: rec.projectKey,
      ifcGuid: rec.ifcGuid || undefined,   // THE join key
    },
    freshness: stamp({ source: SOURCE, revisionId: rec.modified, asOf: rec.modified, confidence: 'live' }),
    payload: rec,
  };
}

const rows = await fetchSource();
const records = rows.map(toSpine).map((r) => ({ ...r, ...checkConformance(r) }));

for (const r of records) {                 // one provenance event per issue
  if (!r.conformant) continue;
  append(LEDGER, {
    source: SOURCE, action: 'issue_observed', result: 'triaged',
    projectKey: r.identity.projectKey,
    targetKeys: { ifcGuid: r.identity.ifcGuid },
    actor: 'service:dalux',
    after: r.payload,
  });
}

console.log(JSON.stringify({ source: SOURCE, spineVersion: SPINE_VERSION,
  conformant: records.every((r) => r.conformant), records }, null, 2));
process.exit(records.every((r) => r.conformant) ? 0 : 1);
