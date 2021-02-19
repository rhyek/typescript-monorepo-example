#!/usr/bin/env ts-node-transpile-only
import fs from 'fs/promises';
import path from 'path';
import yargs from 'yargs';
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
        .option('replace', {
          type: 'boolean',
          alias: 'r',
          describe: 'replace the workspace lockfile',
        })
        .conflicts('outFile', 'replace')
        .version(false)
        .help()
        .check((argv) => {
          if (!argv.outFile && !argv.replace) {
            throw new Error(
              'Please specify either an outfile or the --replace option',
            );
          }
          return true;
        });
    },
    async (argv) => {
      const { package: packageName } = (argv as unknown) as { package: string };
      let { outFile } = argv as { outFile?: string };
      if (!outFile) {
        outFile = lockfileName;
      }
      if (!path.isAbsolute(outFile)) {
        outFile = path.resolve(process.cwd(), outFile);
      }
      const workspaceDir = await findWorkspaceDir();
      const { content } = await makeDedicatedLockfileForPackage(
        workspaceDir,
        packageName,
        true,
      );
      await fs.writeFile(outFile, content, { encoding: 'utf8' });
      console.log(`Created ${outFile}.`);
    },
  )
  .parse();
