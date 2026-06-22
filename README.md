# Mycelium-for-Dalux

Mycelium connector for **Dalux Field/Build** — pulls BCF topics into the Connective Spine, joined to your BIM via `ifcGuid`.

## One-click install

**Mac / Linux**
```sh
git clone https://github.com/thomhoffer-arch/Mycelium-for-Dalux.git
cd Mycelium-for-Dalux
./install.sh
```

**Windows (PowerShell)**
```powershell
git clone https://github.com/thomhoffer-arch/Mycelium-for-Dalux.git
cd Mycelium-for-Dalux
.\install.ps1
```

The installer will:
1. Check Node.js 18+ is present
2. Run `npm install`
3. Prompt you for your Dalux credentials and write `.env`
4. Do a live smoke-run and print results

## Requirements

- [Node.js 18+](https://nodejs.org)
- A Dalux Field/Build subscription with BCF-API access + OAuth2 credentials (or a pre-obtained API token)

## After install

```sh
cd mycelium-draft/connectors/dalux
node connector.mjs        # re-run any time
```

See [`mycelium-draft/connectors/dalux/README.md`](mycelium-draft/connectors/dalux/README.md) for full documentation including write-back, env vars, and vendor re-sync.

## License

Apache-2.0
