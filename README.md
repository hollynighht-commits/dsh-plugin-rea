# REA for DeepSeek Harness

Connect [REA](https://github.com/morluto/rea) to DeepSeek Harness as a local MCP server, so the
agent can reverse engineer targets instead of guessing: native binaries, Electron and
JavaScript apps, .NET assemblies, Android packages, firmware, web pages and recorded captures.

This package is a **DeepSeek Harness bundle**. It ships no REA code: one row mounts a small
diagnostic module (`index.js`, which reports a missing REA install with the exact fix), and one
row runs the `@deepseek-ai/dsh-mcp-client` bridge to REA's stdio server.

## Install

```bash
dsh plugin --profile web add dsh-plugin-rea-mcp
```

Without the npm package, install from source:

```bash
dsh plugin --profile web add github:hollynighht-commits/dsh-plugin-rea
```

In the Desktop app, use **Plugins → Add plugin** with `dsh-plugin-rea-mcp` (or the Git address),
then restart.

## What you get

The whole REA tool set in every session, exposed as `mcp__rea__*` (inspect, decompile, trace,
capture, compare — roughly two hundred operations). Pair it with REA's investigation skill
(`reverse-engineer-anything`) for the full workflow: the skill supplies the procedure, this
bundle supplies the tools.

## Requirements

1. **Node.js** on `PATH` (`node --version`).
2. **REA installed globally**:

   ```bash
   npm install -g rea-agents
   ```

   REA 6.x needs Node 22.19+ or Node 24.11+ on the 24 line; later releases require 24.22.1+.
3. Deep native analysis additionally needs Hopper, Ghidra, IDA or Kuna. Static JavaScript,
   .NET, Android and web analysis work without a native engine.

## Verify

Start a new session and ask the agent to use a REA tool, or check that a process running
`rea.mjs mcp` exists while the app is open. A tool that answers proves the connection; the row
fails loudly at startup when it cannot connect (`failOnStartupError: true`), so a broken install
shows up in **Plugins** instead of silently providing nothing.

## Path resolution

`cordis.patch.yml` resolves REA's MCP entry at load time:

| Platform | Resolved path |
| --- | --- |
| Windows | `%APPDATA%\npm\node_modules\rea-agents\scripts\rea.mjs` |
| macOS / Linux | `<node prefix>/lib/node_modules/rea-agents/scripts/rea.mjs` |

If your global prefix differs (pnpm, a custom `npm --prefix`, asdf, Volta, …), print the real
location and put it in `cordis.patch.yml` as `args[0]`:

```bash
npm root -g
```

Then restart the app.

## Compatibility

- Target: DeepSeek Harness 0.2.x (verified on Desktop 0.2.2-rc.5, Windows).
- Profiles: `web` and `desktop`; the bundle declares no host-specific code.
- Platform: the Windows path branch is verified; the macOS/Linux branch follows the standard
  Node prefix and has a documented manual override.

## Limitations

- REA analyzes targets **locally**; only its tool results reach the model, and the model
  provider has its own data policy.
- Tools appear per session: a session started before the bundle was enabled does not gain them.
- The REA version you get is your global install; this bundle pins nothing.
- Turning the bundle off or removing it removes every `mcp__rea__*` tool. REA stays installed.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| Row fails with `Connection closed` | `node` not on `PATH`, or `rea-agents` missing. Install it, then check `npm root -g`. |
| A warning mentions the missing REA entry | The diagnostic row found no `rea-agents`; run `npm install -g rea-agents`. |
| Tools missing in an old session | Start a new session. |
| `rea` works in a terminal but not here | The Host may see a different `PATH`; use the absolute-path override. |

## Uninstall

Turn the bundle off in **Plugins**, or remove it. For the CLI:
`dsh plugin --profile web remove dsh-plugin-rea-mcp`. To remove REA itself:
`npm uninstall -g rea-agents`.

## License

MIT for this wrapper (see `LICENSE`). REA is a separate MIT-licensed project by
[morluto](https://github.com/morluto/rea); this package contains none of its code.
