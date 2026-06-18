# mycelium-for-dalux

A [Mycelium](https://connectivespine.org) connector for **Dalux Field/Build** — BCF topics joined back to the source BIM via `ifcGuid`, with OAuth2 auth, full pagination, and status write-back.

## Install

```sh
npm install
```

No external runtime dependencies — `vendor/` contains vendored copies of `mycelium-sdk` and `bcf-api`.

## Run

```sh
cp .env.example .env   # fill in your credentials
node connector.mjs
```

Should print `"conformant": true` for a live Dalux project.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DALUX_TOKEN_URL` | yes* | OAuth2 token endpoint (confirm with Dalux docs) |
| `DALUX_CLIENT_ID` | yes* | OAuth2 client id |
| `DALUX_CLIENT_SECRET` | yes* | OAuth2 client secret |
| `DALUX_SCOPE` | no | OAuth2 scope (default: empty) |
| `DALUX_TOKEN` | alt | Pre-obtained bearer token (bypasses OAuth2 flow) |
| `DALUX_PROJECT_ID` | yes | Dalux project UUID |
| `DALUX_PROJECT_KEY` | yes | Short project key used as the spine `projectKey` |

*Not required if `DALUX_TOKEN` is set.

Never commit secrets — `.env` is in `.gitignore`.

## Write-back

```js
import { setTopicStatus } from './connector.mjs';

await setTopicStatus({
  topicGuid:  '<bcf-topic-guid>',
  ifcGuid:    '<ifc-global-id>',
  before:     'Open',
  after:      'Closed',
  actor:      'service:dalux-automation',
  approvedBy: 'human:site-manager',
});
```

Emits `proposed` → `executed` provenance events to `ledger.jsonl`.

## Vendored dependencies

| File | Source |
|---|---|
| `vendor/bcf-api.mjs` | `Mycelium/packages/bcf-api/bcf-api.mjs` |
| `vendor/mycelium-sdk.mjs` | `Mycelium/packages/mycelium-sdk/mycelium-sdk.mjs` |

To re-sync: `cp <Mycelium>/packages/bcf-api/bcf-api.mjs vendor/bcf-api.mjs` (and likewise for the SDK).

## Wire it to real Dalux

`fetchSource()` in `vendor/bcf-api.mjs` → `makeBcfApiFetch` pulls live BCF topics with `$top/$skip` pagination. Confirm Dalux's paging convention (and the token endpoint) against the Dalux BCF-API docs; items marked `// verify` in source need field-level confirmation.

## Reference

- [Mycelium spec](https://connectivespine.org/spec/)
- [BCF-API 2.1](https://github.com/buildingSMART/BCF-API)

## License

Apache-2.0
