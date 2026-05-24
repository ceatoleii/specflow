export class SpecflowCliError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "SpecflowCliError";
    this.code = code;
  }
}
