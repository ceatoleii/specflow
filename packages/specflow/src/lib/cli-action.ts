import { SpecflowCliError } from "../errors.js";
import { InitCancelledError } from "../commands/init.js";

export function runCommandAction(
  handler: () => void | Promise<void>,
  options?: { onCancel?: () => never }
): void {
  Promise.resolve()
    .then(() => handler())
    .catch((error: unknown) => {
      if (error instanceof InitCancelledError) {
        (options?.onCancel ?? (() => process.exit(0)))();
        return;
      }
      if (error instanceof SpecflowCliError) {
        console.error(error.message);
        process.exit(1);
        return;
      }
      throw error;
    });
}
