import fs from 'fs';
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

function countLines(path: string) {
  const f = fs.readFileSync(path, { encoding: 'utf8' });
  return f.split('\n').length;
}

export async function makeDedicatedLockfileForPackage(
  originLockfileDir: string,
  forPackageName: string,
  includeDependencies: boolean,
) {
  const workspaceDir = await findWorkspaceDir();
  const { allProjects } = await readProjects(workspaceDir, []);
  const filtered = await filterPkgsBySelectorObjects(
    allProjects,
    [
      {
        namePattern: forPackageName,
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
  const originalLineCount = countLines(
    path.resolve(workspaceDir, lockfileName),
  );
  const allImporters = lockfile.importers;
  lockfile.importers = {};
  for (const [importerId, importer] of Object.entries(allImporters)) {
    const fullPath = path.resolve(workspaceDir, importerId);
    if (filteredPaths.some((p) => p === fullPath)) {
      lockfile.importers[importerId] = importer;
    }
  }
  const dedicatedLockfile = pruneSharedLockfile(lockfile);
  const tempDir = tempy.directory();
  await writeWantedLockfile(tempDir, dedicatedLockfile);
  const dedicatedLockfilePath = path.resolve(tempDir, lockfileName);
  const dedicatedLineCount = countLines(dedicatedLockfilePath);
  const dedicatedLockfileContent = fs.readFileSync(dedicatedLockfilePath, {
    encoding: 'utf8',
  });
  fs.rmSync(dedicatedLockfilePath);

  return {
    content: dedicatedLockfileContent,
    lineCount: {
      original: originalLineCount,
      dedicated: dedicatedLineCount,
      difference: originalLineCount - dedicatedLineCount,
    },
  };
}
