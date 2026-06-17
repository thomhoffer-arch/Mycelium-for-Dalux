#!/usr/bin/env node
// mycelium-for-dalux — Dalux Field/Build issue → spine records.
// Each issue joins to the source model via ifcGuid and to a site location
// via zone. Confidence is 'live' because Field issues are observed on site.
import { runAdapter } from 'mycelium-sdk';

const config = {
  source: 'dalux',
  identity: {
    uniqueId: 'dalux:{issueId}',
    projectKey: '{project}',
    localIdField: 'issueId',
  },
  freshness: {
    revisionId: '{updatedAt}',
    asOf: '{updatedAt}',
    confidence: 'live',
  },
};

async function fetchSource() {
  // Replace with a real Dalux Field/Build API call.
  return [
    {
      issueId: 'DLX-2026-0091',
      project: 'horizons',
      ifcGuid: '2gggggkxlCpDtTxkxkxkxl',
      zone: { kind: 'siteRegion', id: 'Horizons_B_Onderbouw', name: 'B – onderbouw' },
      updatedAt: '2026-06-17T09:00:00Z',
    },
  ];
}

const result = await runAdapter(config, { fetchSource });
console.log(JSON.stringify(result, null, 2));
process.exit(result.conformant ? 0 : 1);
