// SPDX-License-Identifier: Apache-2.0
// Connective Spine conformance validator — stub for Mycelium-for-Dalux (v0.1 DRAFT).

const REQUIRED_IDENTITY_KEYS = ['source', 'sourceLocalId', 'projectKey'];

/**
 * Check whether a Spine record meets minimum conformance requirements.
 * Returns { conformant: boolean, violations: string[] } merged into the record.
 * @param {{ identity: object, freshness: object, payload: object }} record
 */
export function checkConformance(record) {
  const violations = [];

  if (!record.identity) {
    violations.push('missing identity block');
  } else {
    for (const key of REQUIRED_IDENTITY_KEYS) {
      if (record.identity[key] == null || record.identity[key] === '') {
        violations.push(`identity.${key} is required`);
      }
    }
  }

  if (!record.freshness) violations.push('missing freshness block');
  if (!record.payload)   violations.push('missing payload block');

  return { conformant: violations.length === 0, violations };
}
