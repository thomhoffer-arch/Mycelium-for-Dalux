# Mycelium-for-Dalux

Live REST connector: Dalux Field/Build **issues & defects** → Connective Spine. A **bridge** for
firms already on Dalux (an onramp to Loam + the OpenAEC backbone).

- **Auth:** `X-API-KEY` header (Dalux Build API; no OAuth). Config: `DALUX_URL`, `DALUX_API_KEY`,
  `DALUX_PROJECT_ID`.
- **Join key:** `ifcGuid` — Dalux issues are BCF-style and point at element GUIDs.
- **Freshness:** `live` (direct API pull).
- **Provenance:** one `issue_observed` event per issue.
- **Residency:** Dalux is **EU (Danish)** but a **third-party SaaS** — outbound read; the
  hosted-source caveat applies (firm's data on Dalux's cloud).
- **Access:** requires the firm's Dalux subscription with API access enabled + a key.
- **Gap:** needs the `ifcGuid` adapter patch
  ([`../../PATCH-spine-adapter-ifcguid.md`](../../PATCH-spine-adapter-ifcguid.md)) — until then,
  identity is hand-built here.
- **Endpoints:** best-effort, marked `// verify` — confirm against the Dalux Build API docs.
- **Status:** 🧪 experimental (draft). **License:** Apache-2.0.
