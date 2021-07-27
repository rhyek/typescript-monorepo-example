#!/usr/bin/env ts-node-transpile-only
import 'colors';
import parseArgs from 'minimist';
import { getDirForAppName } from './common/app-name-utils';

if (require.main === module) {
  async function main() {
    const argv = parseArgs(process.argv.slice(2));
    const [appName] = argv._;
    return await getDirForAppName(appName);
  }
  main();

  process.on('unhandledRejection', (error) => {
    throw error;
  });
}
