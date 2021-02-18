import 'colors';
import { main as runLint } from './ci/run-lint';
import { main as runTests } from './ci/run-tests';

async function main() {
  console.log('Running lint.'.cyan.bold);
  await runLint();
  console.log('Running unit tests.'.cyan.bold);
  await runTests('unit');
  console.log('Running integration tests.'.cyan.bold);
  await runTests('e2e');
}

main();

process.on('unhandledRejection', (error) => {
  throw error;
});
