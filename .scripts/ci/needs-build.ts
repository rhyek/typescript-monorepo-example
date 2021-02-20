#!/usr/bin/env ts-node-transpile-only
import yargs from 'yargs';
import { findChangedPackages } from './common/find-changed-packages';

yargs(process.argv.slice(2))
  .command(
    '$0 <package>',
    'decide wether to docker build a package',
    (yargs) => {
      yargs
        .positional('package', {
          type: 'string',
          describe: 'package name as shown in its package.json',
        })
        .version(false)
        .help();
    },
    async (argv) => {
      const { package: packageName } = (argv as unknown) as { package: string };
      const changed = await findChangedPackages([
        {
          parentDir: 'shared',
          excludeSelf: true,
          includeDependents: true,
          diffInclude: [/tsconfig\.(build\.)?json/, /\/package\.json/, /\.ts$/],
          diffExclude: /\.(e2e-)?spec\.ts$/,
        },
        {
          namePattern: packageName,
          diffInclude: [/tsconfig\.(build\.)?json/, /\/package\.json/, /\.ts$/],
          diffExclude: /\.(e2e-)?spec\.ts$/,
        },
      ]);
      if (changed.includes(packageName)) {
        console.log('true');
      } else {
        console.log('false');
      }
    },
  )
  .parse();
