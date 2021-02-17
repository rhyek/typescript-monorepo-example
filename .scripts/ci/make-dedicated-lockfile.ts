import fs from 'fs';
import path from 'path';
import tempy from 'tempy';
import {
  filterPkgsBySelectorObjects,
  readProjects,
} from '@pnpm/filter-workspace-packages';
import { Project } from '@pnpm/find-workspace-packages';
import { Lockfile, pruneSharedLockfile } from '@pnpm/prune-lockfile';
import { readWantedLockfile, writeWantedLockfile } from '@pnpm/lockfile-file';
import { findWorkspaceDir } from './common/pnpm-helpers';

async function main() {
  // const workspaceDir = await findWorkspaceDir();
  // const packageName = process.argv[2];
  // if (!packageName) {
  //   throw new Error('Package name missing.');
  // }
  // const outFile = process.argv[3] ?? `${workspaceDir}/${lockfileName}`;
  // const { allProjects } = await readProjects(workspaceDir, []);
  // const filtered = await filterPkgsBySelectorObjects(
  //   allProjects,
  //   [
  //     {
  //       namePattern: packageName,
  //       includeDependencies: true,
  //     },
  //   ],
  //   { workspaceDir },
  // );
  // const filteredPaths = Object.keys(filtered.selectedProjectsGraph);
  // const lockfile = await readWantedLockfile(workspaceDir, {
  //   ignoreIncompatible: false,
  // });
  // if (!lockfile) {
  //   throw new Error('No lockfile found.');
  // }
  // const originalLineCount = countLines(
  //   path.resolve(workspaceDir, lockfileName),
  // );
  // const allImporters = lockfile.importers;
  // lockfile.importers = {};
  // for (const [importerId, importer] of Object.entries(allImporters)) {
  //   const fullPath = path.resolve(workspaceDir, importerId);
  //   if (filteredPaths.some((p) => p === fullPath)) {
  //     lockfile.importers[importerId] = importer;
  //   }
  // }
  // const dedicatedLockfile = pruneSharedLockfile(lockfile);
  // const tempDir = tempy.directory();
  // await writeWantedLockfile(tempDir, dedicatedLockfile);
  // const dedicatedLockfilePath = path.resolve(tempDir, lockfileName);
  // const finalLineCount = countLines(dedicatedLockfilePath);
  // console.log(
  //   workspaceDir,
  //   packageName,
  //   outFile,
  //   // JSON.stringify(lockFile, null, 2),
  //   // JSON.stringify(dedicatedLockfile, null, 2),
  //   [originalLineCount, finalLineCount],
  //   dedicatedLockfilePath,
  // );
}

main();
