import { resolveTargetDir } from "../lib/paths.js";
import {
  buildReport,
  runStaticChecks,
  runVerificationCommands,
} from "../lib/doctor/checks.js";
import type { DoctorCheck, DoctorReport } from "../lib/doctor/types.js";

export interface DoctorOptions {
  cwd?: string;
  run?: boolean;
  json?: boolean;
}

function formatCheck(c: DoctorCheck): string {
  const icon = c.passed ? "✓" : c.severity === "error" ? "✗" : "⚠";
  return `  ${icon} [${c.id}] ${c.message}`;
}

export async function runDoctor(options: DoctorOptions): Promise<DoctorReport> {
  const targetDir = resolveTargetDir(options.cwd);
  const checks = await runStaticChecks(targetDir);

  if (options.run) {
    checks.push(...(await runVerificationCommands(targetDir)));
  }

  const { hasErrors, hasWarnings } = buildReport(checks);
  const report: DoctorReport = { checks, hasErrors, hasWarnings };

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
    return report;
  }

  console.log(`\nSpecFlow doctor — ${targetDir}\n`);
  for (const c of checks) {
    console.log(formatCheck(c));
  }

  if (hasErrors) {
    console.log("\n  Result: errors found (exit 1)");
  } else if (hasWarnings) {
    console.log("\n  Result: warnings only (exit 0)");
  } else {
    console.log("\n  Result: all checks passed ✓");
  }

  if (!options.run) {
    console.log("\n  Tip: specflow doctor --run to execute verification.md commands");
  }

  return report;
}
