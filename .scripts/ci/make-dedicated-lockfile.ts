#!/usr/bin/env ts-node-transpile-only
import fs from 'fs/promises';
import path from 'path';
import yargs from 'yargs';
import execa from 'execa';
import { findWorkspaceDir } from './common/pnpm-helpers';
import { lockfileName } from './common/consts';
import { makeDedicatedLockfileForPackage } from './common/dedicated-lockfile';

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
      const { package: packageName } = (argv as unknown) as { package: string };
      let { outFile } = argv as { outFile?: string };
      if (!outFile) {
        const { stdout: pkgPath } = await execa('pnpm', [
          'exec',
          '--filter',
          packageName,
          'pwd',
        ]);
        outFile = path.resolve(pkgPath, lockfileName);
      }
      if (!path.isAbsolute(outFile)) {
        outFile = path.resolve(process.cwd(), outFile);
      }
      const workspaceDir = await findWorkspaceDir();
      const result = await makeDedicatedLockfileForPackage(
        workspaceDir,
        packageName,
        true,
      );
      if (result === null) {
        throw new Error('No lockfile generated.');
      }
      const { content } = result;
      await fs.writeFile(outFile, content, { encoding: 'utf8' });
      console.log(`Created ${outFile}`);
    },
  )
  .parse();
