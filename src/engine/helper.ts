export function getNestedFieldValue(
    obj: Record<string, unknown>,
    field: string
  ): unknown {
    const fields = field.split(".");
    return fields.reduce<unknown>((acc, currentField) => {
      if (acc === undefined || acc === null || typeof acc !== "object") {
        return undefined; // If path is invalid, return undefined
      }
      return (acc as Record<string, unknown>)[currentField];
    }, obj);
  }
  