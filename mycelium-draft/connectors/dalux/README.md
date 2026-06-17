# mycelium-for-dalux

A [Mycelium](https://connectivespine.org) connector for **Dalux Field/Build** — site issue records joined back to the source BIM via `ifcGuid`.

## Install

```sh
npm install
```

## Run

```sh
node connector.mjs
```

Should print `"conformant": true`.

## Wire it to real Dalux

Replace `fetchSource()` in `connector.mjs` with a call to the Dalux Field/Build API. Keep the field shape — the spine adapter normalises and conformance-checks the rest.

## Reference

- [Mycelium spec](https://connectivespine.org/spec/)
- [mycelium-sdk on npm](https://www.npmjs.com/package/mycelium-sdk)

## License

Apache-2.0
