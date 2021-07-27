import fs from 'fs/promises';
import path from 'path';
import tempy from 'tempy';
import {
  filterPkgsBySelectorObjects,
  readProjects,
} from '@pnpm/filter-workspace-packages';
import { readWantedLockfile, writeWantedLockfile } from '@pnpm/lockfile-file';
import { pruneSharedLockfile } from '@pnpm/prune-lockfile';
import { lockfileName } from './consts';
import { findWorkspaceDir } from './pnpm-helpers';
import { getDirForAppName } from './app-name-utils';

export async function _internalMakeDedicatedLockfileForPackage(
  originLockfileDir: string,
  forAppName: string,
  includeDependencies: boolean,
) {
  const workspaceDir = await findWorkspaceDir();
  const { allProjects } = await readProjects(workspaceDir, []);
  const filtered = await filterPkgsBySelectorObjects(
    allProjects,
    [
      {
        parentDir: await getDirForAppName(forAppName),
        includeDependencies,
      },
    ],
    { workspaceDir },
  );
  const filteredPaths = Object.keys(filtered.selectedProjectsGraph);
  const lockfile = await readWantedLockfile(originLockfileDir, {
    ignoreIncompatible: false,
  });
  if (!lockfile) {
    throw new Error('No lockfile found.');
  }
  const allImporters = lockfile.importers;
  lockfile.importers = {};
  for (const [importerId, importer] of Object.entries(allImporters)) {
    const fullPath = path.resolve(workspaceDir, importerId);
    if (filteredPaths.some((p) => p === fullPath)) {
      lockfile.importers[importerId] = importer;
    }
  }
  const dedicatedLockfile = pruneSharedLockfile(lockfile);
  if (Object.keys(dedicatedLockfile.importers).length === 0) {
    return null;
  } else {
    const tempDir = tempy.directory();
    await writeWantedLockfile(tempDir, dedicatedLockfile);
    const dedicatedLockfilePath = path.resolve(tempDir, lockfileName);
    const dedicatedLockfileContent = await fs.readFile(dedicatedLockfilePath, {
      encoding: 'utf8',
    });
    await fs.rm(dedicatedLockfilePath);

    return {
      content: dedicatedLockfileContent,
    };
  }
}
