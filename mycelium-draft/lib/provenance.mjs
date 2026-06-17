// SPDX-License-Identifier: Apache-2.0
// Provenance ledger helper — stub for Mycelium-for-Dalux (v0.1 DRAFT).
import { appendFileSync } from 'node:fs';

/**
 * Append one JSONL provenance event to the ledger file.
 * @param {string} ledgerPath
 * @param {object} event
 */
export function append(ledgerPath, event) {
  const line = JSON.stringify({ ...event, ts: new Date().toISOString() });
  appendFileSync(ledgerPath, line + '\n', 'utf8');
}
