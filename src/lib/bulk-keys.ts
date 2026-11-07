export function parseBulkKeys(input: string): string[] {
  return input.split(/[,\n]/).map((key) => key.trim()).filter(Boolean);
}

export function bulkKeyRows(input: string) {
  const keys = parseBulkKeys(input);
  if (keys.length === 0) throw new Error("Please enter at least one key.");
  if (keys.some((key) => key.length > 500)) throw new Error("Each key must be 500 characters or fewer.");
  return keys.map((key_value) => ({ key_value, is_admin_drop: true as const }));
}