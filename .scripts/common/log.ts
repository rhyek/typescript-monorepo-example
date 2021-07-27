export function debug(...args: any[]) {
  if (process.env.DEBUG === 'true') {
    console.debug(...args);
  }
}
