export function getNestedFieldValue(
  obj: Record<string, unknown>,
  field: string
): unknown {
  const fields = field.split(".");

  return fields.reduce<unknown>((acc, currentField) => {
    if (acc === undefined || acc === null) {
      return undefined;
    }

    if (
      typeof acc === "string" &&
      (acc.startsWith("{") || acc.startsWith("["))
    ) {
      try {
        acc = JSON.parse(acc);
      } catch {
        return undefined;
      }
    }

    if (typeof acc === "object" && acc !== null) {
      return (acc as Record<string, unknown>)[currentField] ?? undefined;
    }

    return undefined;
  }, obj);
}
