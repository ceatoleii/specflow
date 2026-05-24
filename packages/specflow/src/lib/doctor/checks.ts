import fs from "fs-extra";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  FLOW_FLAG,
  FLOW_PHASE_FILE,
  STATE_CURRENT,
  VERSION_FILE,
} from "../paths.js";
import { isFlowActive } from "../flow.js";
import type { DoctorCheck } from "./types.js";

const VALID_PHASES = new Set([
  "refining",
  "designing",
  "implementing",
  "reviewing",
]);

function check(
  id: string,
  severity: DoctorCheck["severity"],
  passed: boolean,
  message: string
): DoctorCheck {
  return { id, severity, passed, message };
}

export async function runStaticChecks(targetDir: string): Promise<DoctorCheck[]> {
  const checks: DoctorCheck[] = [];

  const versionPath = path.join(targetDir, VERSION_FILE);
  if (await fs.pathExists(versionPath)) {
    checks.push(
      check("installed", "info", true, `SpecFlow installed (${VERSION_FILE})`)
    );
  } else {
    checks.push(
      check(
        "installed",
        "error",
        false,
        `Not installed — run: specflow init`
      )
    );
    return checks;
  }

  const orchestrator = path.join(targetDir, ".agents/rules/orchestrator.md");
  const agentsMd = path.join(targetDir, "AGENTS.md");
  if (!(await fs.pathExists(orchestrator))) {
    checks.push(
      check(
        "orchestrator",
        "error",
        false,
        "Missing .agents/rules/orchestrator.md — run: specflow sync"
      )
    );
  } else {
    checks.push(check("orchestrator", "info", true, "Orchestrator rules present"));
  }

  if (!(await fs.pathExists(agentsMd))) {
    checks.push(
      check("agents-md", "warn", false, "Missing AGENTS.md — run: specflow sync")
    );
  } else {
    checks.push(check("agents-md", "info", true, "AGENTS.md present"));
  }

  const gitignorePath = path.join(targetDir, ".gitignore");
  if (await fs.pathExists(gitignorePath)) {
    const gitignore = await fs.readFile(gitignorePath, "utf-8");
    if (gitignore.includes(".agents-state")) {
      checks.push(
        check("gitignore", "info", true, ".agents-state/ listed in .gitignore")
      );
    } else {
      checks.push(
        check(
          "gitignore",
          "warn",
          false,
          "Add .agents-state/ to .gitignore"
        )
      );
    }
  } else {
    checks.push(
      check(
        "gitignore",
        "warn",
        false,
        "No .gitignore — add .agents-state/"
      )
    );
  }

  const verification = path.join(targetDir, ".agents-docs/verification.md");
  if (await fs.pathExists(verification)) {
    checks.push(
      check("verification-doc", "info", true, ".agents-docs/verification.md present")
    );
  } else {
    checks.push(
      check(
        "verification-doc",
        "warn",
        false,
        "Missing .agents-docs/verification.md — run init with docs or create manually"
      )
    );
  }

  const planTemplate = path.join(
    targetDir,
    ".agents/templates/plan-template.md"
  );
  if (await fs.pathExists(planTemplate)) {
    checks.push(check("plan-template", "info", true, "plan-template.md present"));
  } else {
    checks.push(
      check(
        "plan-template",
        "warn",
        false,
        "Missing plan-template.md — run: specflow sync"
      )
    );
  }

  if (await isFlowActive(targetDir)) {
    checks.push(...(await runFlowChecks(targetDir)));
  } else {
    checks.push(
      check("flow", "info", true, "Flow inactive (no .flow-enabled)")
    );
  }

  return checks;
}

async function runFlowChecks(targetDir: string): Promise<DoctorCheck[]> {
  const checks: DoctorCheck[] = [];
  checks.push(
    check("flow", "info", true, "Flow active (.flow-enabled)")
  );

  const phasePath = path.join(targetDir, FLOW_PHASE_FILE);
  if (!(await fs.pathExists(phasePath))) {
    checks.push(
      check(
        "phase",
        "error",
        false,
        "Flow active but missing .agents-state/current/phase.md"
      )
    );
    return checks;
  }

  const phase = (await fs.readFile(phasePath, "utf-8")).trim();
  if (!VALID_PHASES.has(phase)) {
    checks.push(
      check(
        "phase",
        "error",
        false,
        `Invalid phase.md: "${phase}"`
      )
    );
    return checks;
  }

  checks.push(check("phase", "info", true, `Current phase: ${phase}`));

  const current = path.join(targetDir, STATE_CURRENT);
  const exists = async (name: string) =>
    fs.pathExists(path.join(current, name));

  if (phase === "designing" || phase === "implementing" || phase === "reviewing") {
    if (!(await exists("task.md"))) {
      checks.push(
        check("artifact-task", "error", false, "Missing current/task.md")
      );
    } else {
      checks.push(check("artifact-task", "info", true, "task.md present"));
    }
  }

  if (phase === "implementing" || phase === "reviewing") {
    const hasPlan =
      (await exists("plan.md")) || (await exists("sdd.md"));
    if (!hasPlan) {
      checks.push(
        check(
          "artifact-plan",
          "error",
          false,
          "Missing current/plan.md (or legacy sdd.md)"
        )
      );
    } else {
      checks.push(check("artifact-plan", "info", true, "plan.md (or sdd.md) present"));
    }
    if (!(await exists("tasks.md"))) {
      checks.push(
        check("artifact-tasks", "error", false, "Missing current/tasks.md")
      );
    } else {
      checks.push(check("artifact-tasks", "info", true, "tasks.md present"));
    }
  }

  return checks;
}

export function extractVerificationCommands(
  verificationMarkdown: string
): string[] {
  const commands: string[] = [];
  const blockRe = /```(?:bash|sh|zsh)\s*\n([\s\S]*?)```/gi;
  let match: RegExpExecArray | null;
  while ((match = blockRe.exec(verificationMarkdown)) !== null) {
    const lines = match[1]
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"));
    const cmd = lines.find((l) => !l.startsWith("#"));
    if (cmd) commands.push(cmd);
  }
  return commands;
}

export async function runVerificationCommands(
  targetDir: string
): Promise<DoctorCheck[]> {
  const verificationPath = path.join(targetDir, ".agents-docs/verification.md");
  if (!(await fs.pathExists(verificationPath))) {
    return [
      check(
        "verify-run",
        "warn",
        false,
        "Skipped --run: no .agents-docs/verification.md"
      ),
    ];
  }

  const content = await fs.readFile(verificationPath, "utf-8");
  const commands = extractVerificationCommands(content);
  if (commands.length === 0) {
    return [
      check(
        "verify-run",
        "warn",
        false,
        "No bash commands found in verification.md"
      ),
    ];
  }

  const checks: DoctorCheck[] = [];
  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i]!;
    try {
      execSync(cmd, {
        cwd: targetDir,
        stdio: "pipe",
        encoding: "utf-8",
        timeout: 120_000,
      });
      checks.push(
        check(`verify-${i + 1}`, "info", true, `OK: ${cmd}`)
      );
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : String(error);
      checks.push(
        check(`verify-${i + 1}`, "warn", false, `Failed: ${cmd} — ${msg.slice(0, 200)}`)
      );
    }
  }
  return checks;
}

export function buildReport(checks: DoctorCheck[]): {
  hasErrors: boolean;
  hasWarnings: boolean;
} {
  return {
    hasErrors: checks.some((c) => !c.passed && c.severity === "error"),
    hasWarnings: checks.some((c) => !c.passed && c.severity === "warn"),
  };
}
