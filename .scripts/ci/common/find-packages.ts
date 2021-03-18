import {
  filterPkgsBySelectorObjects,
  PackageSelector,
  readProjects,
} from '@pnpm/filter-workspace-packages';
import { findWorkspaceDir } from './pnpm-helpers';

export async function findPackages(selectors: PackageSelector[]) {
  const workspaceDir = await findWorkspaceDir();
  const { allProjects } = await readProjects(workspaceDir, []);
  const { selectedProjectsGraph } = await filterPkgsBySelectorObjects(
    allProjects,
    selectors,
    {
      workspaceDir,
    }
  );
  const packageNames = Object.values(selectedProjectsGraph).map(
    (node) => node.package.manifest.name!
  );
  return packageNames;
}
