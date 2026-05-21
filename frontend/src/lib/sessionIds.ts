export function createSessionId(): string {
  return `sess_${crypto.randomUUID()}`;
}

export function createAttemptId(): string {
  return `att_${crypto.randomUUID()}`;
}
