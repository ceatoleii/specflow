export type CheckSeverity = "error" | "warn" | "info";

export interface DoctorCheck {
  id: string;
  severity: CheckSeverity;
  passed: boolean;
  message: string;
}

export interface DoctorReport {
  checks: DoctorCheck[];
  hasErrors: boolean;
  hasWarnings: boolean;
}
