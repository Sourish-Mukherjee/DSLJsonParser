export function hasKeys(
  obj: Record<string, unknown>,
  requiredKeys: string[]
): boolean {
  return requiredKeys.every((key) => key in obj);
}
