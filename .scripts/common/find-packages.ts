import {
  filterPkgsBySelectorObjects,
  PackageSelector,
  readProjects,
} from '@pnpm/filter-workspace-packages';
import { getAppNameForDir } from './app-name-utils';
import { findWorkspaceDir } from './pnpm-helpers';
import { PackageInfo } from './types/package-info';

export async function findPackages(
  selectors: PackageSelector[],
): Promise<PackageInfo[]> {
  const workspaceDir = await findWorkspaceDir();
  const { allProjects } = await readProjects(workspaceDir, []);
  const { selectedProjectsGraph } = await filterPkgsBySelectorObjects(
    allProjects,
    selectors,
    {
      workspaceDir,
    },
  );
  const packageInfos = Object.values(selectedProjectsGraph).map((node) => ({
    name: getAppNameForDir(node.package.dir),
    dir: node.package.dir,
  }));
  return packageInfos;
}
