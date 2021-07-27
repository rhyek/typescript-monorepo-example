#!/usr/bin/env ts-node-transpile-only
import yargs from 'yargs';
import { getDirForAppName } from './common/app-name-utils';
import { findChangedPackages } from './common/find-changed-packages';

export async function needsBuild(appName: string) {
  const changed = await findChangedPackages([
    {
      parentDir: 'shared',
      excludeSelf: true,
      includeDependents: true,
      diffInclude: [/tsconfig\.(build\.)?json/, /\/package\.json/, /\.ts$/],
      diffExclude: /\.(e2e-)?spec\.ts$/,
    },
    {
      parentDir: await getDirForAppName(appName),
      diffInclude: [
        /tsconfig\.(build\.)?json$/,
        /\/package\.json$/,
        /Dockerfile$/,
        /\.ts$/,
      ],
      diffExclude: /\.(e2e-)?spec\.ts$/,
    },
  ]);
  return changed.map((c) => c.name).includes(appName);
}

if (require.main === module) {
  yargs(process.argv.slice(2))
    .command(
      '$0 <appName>',
      'decide wether to docker build an app',
      (yargs) => {
        yargs
          .positional('appName', {
            type: 'string',
            describe: 'app name same as its base folder name',
          })
          .version(false)
          .help();
      },
      async (argv) => {
        const { appName } = (argv as unknown) as {
          appName: string;
        };
        if (await needsBuild(appName)) {
          console.log('true');
        } else {
          console.log('false');
        }
      },
    )
    .parse();
}
