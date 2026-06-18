// Vendored Mycelium SDK helpers for Mycelium-for-Dalux.
// Re-sync from Mycelium/packages/mycelium-sdk when the canonical source updates.
// Exports consumed here: runAdapter, deriveIfcGuid, append.

import { appendFileSync } from 'node:fs';

// ── runAdapter ────────────────────────────────────────────────────────────────
// Calls fetchSource(), maps each raw row to a spine record using the config
// template, runs conformance checks, and returns { conformant, source, records }.
export async function runAdapter(config, { fetchSource }) {
  const rows = await fetchSource();
  const records = rows.map((row) => {
    const sub = (t) =>
      typeof t === 'string' ? t.replace(/\{(\w+)\}/g, (_, k) => row[k] ?? '') : t;

    const identity = {
      source:        config.source,
      uniqueId:      sub(config.identity.uniqueId),
      projectKey:    sub(config.identity.projectKey),
      sourceLocalId: row[config.identity.localIdField],
      ...(row.ifcGuid != null ? { ifcGuid: row.ifcGuid }  : {}),
      ...(row.zone    != null ? { zone:    row.zone }      : {}),
    };

    const freshness = {
      source:     config.source,
      revisionId: sub(config.freshness.revisionId) || undefined,
      asOf:       sub(config.freshness.asOf)       || new Date().toISOString(),
      confidence: config.freshness.confidence,
      stampedAt:  new Date().toISOString(),
    };

    const violations = [];
    if (!identity.uniqueId)      violations.push('identity.uniqueId is required');
    if (!identity.projectKey)    violations.push('identity.projectKey is required');
    if (!identity.sourceLocalId) violations.push('identity.sourceLocalId is required');
    if (!freshness.confidence)   violations.push('freshness.confidence is required');

    return { identity, freshness, payload: row, conformant: violations.length === 0, violations };
  });

  return { source: config.source, conformant: records.every((r) => r.conformant), records };
}

// ── deriveIfcGuid ─────────────────────────────────────────────────────────────
// Convert a Revit UniqueId ({episodeGuid}-{elementIdHex}) to an IFC GlobalId
// (22-char custom-base64 string). Algorithm: strip dashes from the episode GUID,
// XOR with the element id, encode with the IFC char table.
// Stub: throws if called — replace with the real implementation from
// Mycelium/packages/mycelium-sdk once available.
export function deriveIfcGuid(revitUniqueId) {
  throw new Error(
    `deriveIfcGuid: real implementation required for UniqueId "${revitUniqueId}". ` +
    'Vendor the full mycelium-sdk to enable Revit→IFC GUID derivation.',
  );
}

// ── append ────────────────────────────────────────────────────────────────────
// Append one JSON-Lines provenance event to the ledger file.
export function append(ledgerPath, event) {
  appendFileSync(ledgerPath, JSON.stringify({ ...event, ts: new Date().toISOString() }) + '\n', 'utf8');
}
