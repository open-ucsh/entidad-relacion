let currentId = 0;

export function createId(prefix: string): string {
  currentId += 1;
  return `${prefix}-${String(currentId)}`;
}

export function resetIdCounter(): void {
  currentId = 0;
}
