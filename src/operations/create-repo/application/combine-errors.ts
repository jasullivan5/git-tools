import { extractErrorMessage } from "./extract-error-message.js";

export function combineErrors(
  originalError: unknown,
  ...subErrorMessages: string[]
) {
  if (subErrorMessages.length === 0) {
    return originalError;
  }
  const subErrorsCombined = `\n${subErrorMessages.join("\n")}`;
  if (originalError instanceof Error) {
    originalError.message += subErrorsCombined;
    return originalError;
  } else {
    const message = extractErrorMessage(originalError) + subErrorsCombined;
    return new Error(message);
  }
}
