// SPDX-License-Identifier: Apache-2.0
// Connective Spine adapter helpers — stub for Mycelium-for-Dalux (v0.1 DRAFT).
// Replace with the real spine-adapter package once the ifcGuid patch lands.

export const SPINE_VERSION = '0.1.0-draft';

/**
 * Produce a freshness stamp for a Spine record.
 * @param {{ source: string, revisionId?: string|null, asOf?: string|null, confidence: string }} opts
 */
export function stamp({ source, revisionId = null, asOf = null, confidence = 'live' }) {
  return {
    source,
    revisionId: revisionId ?? undefined,
    asOf: asOf ?? new Date().toISOString(),
    confidence,
    stampedAt: new Date().toISOString(),
  };
}
