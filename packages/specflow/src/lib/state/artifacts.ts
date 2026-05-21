export const LEGACY_ARTIFACT_FILES = [
  "phase.md",
  "task.md",
  "refinement-log.md",
  "sdd.md",
  "tasks.md",
  "review.md",
] as const;

export type ArtifactKind =
  | "task"
  | "refinement"
  | "sdd"
  | "tasks"
  | "review";

export const ARTIFACT_KIND_TO_FILE: Record<ArtifactKind, string> = {
  task: "task.md",
  refinement: "refinement-log.md",
  sdd: "sdd.md",
  tasks: "tasks.md",
  review: "review.md",
};

export const DB_ARTIFACT_KINDS = ["sdd", "tasks", "review"] as const;

export type DbArtifactKind = (typeof DB_ARTIFACT_KINDS)[number];

export function artifactFileForKind(kind: string): string | undefined {
  return (ARTIFACT_KIND_TO_FILE as Record<string, string>)[kind];
}

export function legacyFileForKind(kind: DbArtifactKind): string {
  return ARTIFACT_KIND_TO_FILE[kind];
}
