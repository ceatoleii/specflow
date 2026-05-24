export class InitCancelledError extends Error {
  constructor() {
    super("INIT_CANCELLED");
    this.name = "InitCancelledError";
  }
}
