#!/usr/bin/env ts-node-transpile-only
import fs from 'fs/promises';
import path from 'path';
import yargs from 'yargs';
import { findWorkspaceDir } from './common/pnpm-helpers';
import { lockfileName } from './common/consts';
import { _internalMakeDedicatedLockfileForPackage } from './common/dedicated-lockfile';
import { getDirForAppName } from './common/app-name-utils';

export async function makeDedicationLockfile(
  appName: string,
  outFile?: string,
) {
  if (!outFile) {
    const pkgPath = await getDirForAppName(appName);
    outFile = path.resolve(pkgPath, lockfileName);
  }
  if (!path.isAbsolute(outFile)) {
    outFile = path.resolve(process.cwd(), outFile);
  }
  const workspaceDir = await findWorkspaceDir();
  const result = await _internalMakeDedicatedLockfileForPackage(
    workspaceDir,
    appName,
    true,
  );
  if (result === null) {
    throw new Error('No lockfile generated.');
  }
  const { content } = result;
  await fs.writeFile(outFile, content, { encoding: 'utf8' });
  return { content, outFile };
}

if (require.main === module) {
  yargs(process.argv.slice(2))
    .command(
      '$0 <package> [outFile]',
      'generate a new pruned pnpm lock file for the specified package',
      (yargs) => {
        yargs
          .positional('package', {
            type: 'string',
            describe: 'package name as shown in its package.json',
          })
          .positional('outFile', {
            type: 'string',
            describe: 'path to the new lockfile',
          })
          .version(false)
          .help();
      },
      async (argv) => {
        const { package: packageName } = (argv as unknown) as {
          package: string;
        };
        const { outFile: paramOutFile } = argv as { outFile?: string };
        const { outFile } = await makeDedicationLockfile(
          packageName,
          paramOutFile,
        );
        console.log(`Created ${outFile}`);
      },
    )
    .parse();

  process.on('unhandledRejection', (error) => {
    throw error;
  });
}
