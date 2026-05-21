export function parseAcceptanceCriteria(taskContent: string): string[] {
  const lines = taskContent.split("\n");
  const criteria: string[] = [];
  let inSection = false;

  for (const line of lines) {
    if (/^##\s+Acceptance Criteria/i.test(line)) {
      inSection = true;
      continue;
    }
    if (inSection && /^##\s+/.test(line)) break;
    if (inSection) {
      const m = line.match(/^-\s+\[[ xX~]\]\s+(.+)$/);
      if (m) criteria.push(m[1].trim());
    }
  }
  return criteria;
}

export interface RefinementMessage {
  round: number;
  role: string;
  content: string;
}

export function parseRefinementMessages(content: string): RefinementMessage[] {
  const messages: RefinementMessage[] = [];
  const blocks = content.split(/^## Round (\d+)/m).slice(1);

  for (let i = 0; i < blocks.length; i += 2) {
    const round = parseInt(blocks[i], 10);
    const body = blocks[i + 1] ?? "";
    const userMatch = body.match(/\*\*User:\*\*([\s\S]*?)(?=\*\*Refiner:\*\*|$)/);
    const refinerMatch = body.match(
      /\*\*Refiner:\*\*([\s\S]*?)(?=\*\*Answers:\*\*|$)/
    );
    const answersMatch = body.match(/\*\*Answers:\*\*([\s\S]*?)$/);

    if (userMatch) {
      messages.push({ round, role: "user", content: userMatch[1].trim() });
    }
    if (refinerMatch) {
      messages.push({ round, role: "agent", content: refinerMatch[1].trim() });
    }
    if (answersMatch?.[1]?.trim()) {
      messages.push({
        round,
        role: "user",
        content: answersMatch[1].trim(),
      });
    }
  }
  return messages;
}

export interface ParsedTask {
  code: string;
  title: string;
  body: string;
  status: string;
  sortOrder: number;
}

export function parseTasksMarkdown(content: string): ParsedTask[] {
  const tasks: ParsedTask[] = [];
  const re = /^- \[( |x|~)\] \*\*(T\d+)\*\* — ([^:]+):\s*(.*)$/gim;
  let m: RegExpExecArray | null;
  let order = 0;

  while ((m = re.exec(content)) !== null) {
    const mark = m[1];
    const status =
      mark === "x" ? "done" : mark === "~" ? "in_progress" : "pending";
    tasks.push({
      code: m[2],
      title: m[3].trim(),
      body: m[4].trim(),
      status,
      sortOrder: order++,
    });
  }
  return tasks;
}
