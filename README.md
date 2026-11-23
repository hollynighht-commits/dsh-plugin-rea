# REA for DeepSeek Harness

Connect [REA](https://github.com/morluto/rea) to DeepSeek Harness as a local MCP server, so
the agent can reverse engineer targets instead of guessing: native binaries, Electron and
JavaScript apps, .NET assemblies, Android packages, firmware, web pages and recorded captures.

This package is a **configuration-only bundle**. It ships no REA code; it declares one MCP
client row named `rea`, and you install REA itself with npm.

## What you get

One stdio MCP client, and therefore the whole REA tool set in every session, exposed as
`mcp__rea__*` (inspect, decompile, trace, capture, compare — roughly two hundred operations).

Pair it with REA's investigation skill (`reverse-engineer-anything`) for the full workflow: the
skill supplies the procedure, this bundle supplies the tools.

## Requirements

1. **Node.js** on `PATH` (`node --version`).
2. **REA installed globally**:

   ```powershell
   npm install -g rea-agents
   ```

   REA 6.x requires Node 22.19+, or Node 24.11+ on the 24 line; its own release notes carry the
   exact range. Check with `rea --version`.

3. Deep native analysis additionally needs Hopper, Ghidra, IDA or Kuna installed. Static
   JavaScript, .NET, Android and web analysis work without a native engine.

## Install

**From the DSH UI.** Open **Plugins → Add plugin**, enter `dsh-plugin-rea`, confirm, then start
a new session.

**From a local checkout.** In **Add plugin**, enter the absolute path to this directory.

## Verify

Start a new session and ask the agent to use a REA tool, or check that a process running
`rea.mjs mcp` exists while the app is open. A tool that answers proves the connection; the row
also fails loudly at startup when it cannot connect (`failOnStartupError: true`), so a broken
install shows up in **Plugins** instead of silently providing nothing.

## Path resolution

`cordis.patch.yml` resolves REA's MCP entry at load time:

| Platform | Resolved path |
| --- | --- |
| Windows | `%APPDATA%\npm\node_modules\rea-agents\scripts\rea.mjs` |
| macOS / Linux | `<node prefix>/lib/node_modules/rea-agents/scripts/rea.mjs` |

If your global prefix differs (pnpm, a custom `npm --prefix`, asdf, Volta, …), print the real
location and put it in `cordis.patch.yml` as the `args[0]` value:

```powershell
npm root -g
```

Then restart the app.

## What it changes

- Adds one row (`rea-mcp`) to the profile's composed configuration. No other plugin is patched,
  no model or provider is touched, and nothing runs in the background when the bundle is off.

## Limitations

- REA analyzes targets **locally**; only its tool results reach the model, and the model
  provider has its own data policy.
- Tools appear per session: a session started before the bundle was enabled does not gain them.
- The REA version you get is your global install; this bundle pins nothing.
- Turning the bundle off or removing it removes every `mcp__rea__*` tool. REA stays installed.
- The macOS/Linux path branch is a convention, not something CI verifies on every layout; the
  override above is the supported fallback.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| Row fails with `Connection closed` | `node` not on `PATH`, or `rea-agents` missing. Install it, then print `npm root -g` and check `scripts/rea.mjs` exists there. |
| Row fails after moving Node | The resolved prefix changed; reinstall Node or set the absolute path. |
| Tools missing in an old session | Start a new session. |
| `rea` works in a terminal but not here | The DSH Host may see a different `PATH`; prefer the absolute-path override. |

## Uninstall

Turn the bundle off in **Plugins**, or remove it there. To remove REA itself:
`npm uninstall -g rea-agents`.

## License

MIT for this wrapper (see `LICENSE`). REA is a separate MIT-licensed project by
[morluto](https://github.com/morluto/rea); this package contains none of its code.
