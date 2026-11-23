import { existsSync } from 'node:fs';

/**
 * Resolve REA's MCP entry the same way cordis.patch.yml does: the global npm
 * prefix on Windows, or the Node prefix on macOS/Linux.
 */
function resolvedReaEntry() {
  const env = process.env;
  if (env.APPDATA) {
    return `${env.APPDATA}/npm/node_modules/rea-agents/scripts/rea.mjs`;
  }
  const nodeDirectory = process.execPath.replace(/[\\/][^\\/]+$/, '');
  return `${nodeDirectory}/../lib/node_modules/rea-agents/scripts/rea.mjs`;
}

/**
 * Validate the REA installation the MCP row points at, and report a missing
 * entry with the exact command that fixes it. The MCP client row stays the
 * source of the tools; this row only diagnoses its prerequisite.
 */
export function apply(ctx) {
  const entry = resolvedReaEntry();
  if (existsSync(entry)) return;

  const message =
    `[dsh-plugin-rea-mcp] REA entry not found: ${entry}. ` +
    'Install it with `npm install -g rea-agents`, or point args[0] in cordis.patch.yml at the path printed by `npm root -g`.';

  if (ctx && typeof ctx.logger?.warn === 'function') ctx.logger.warn(message);
  else console.warn(message);
}
