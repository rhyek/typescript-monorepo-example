#!/usr/bin/env ts-node-transpile-only
import 'colors';
import { main as runLint } from './ci/run-lint';
import { main as runTests } from './ci/run-tests';

async function main() {
  await runLint();
  await runTests('unit');
  await runTests('e2e');
}

main();

process.on('unhandledRejection', (error) => {
  throw error;
});
