export function makeMessage(): string {
  if (typeof process.env.MSG === 'undefined') {
    throw new Error('Message not defined.');
  }
  return process.env.MSG;
}
