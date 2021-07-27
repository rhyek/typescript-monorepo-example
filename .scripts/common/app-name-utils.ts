import path from 'path';
import { findWorkspaceDir } from './pnpm-helpers';

export function getAppNameForDir(dir: string) {
  return path.basename(dir);
}

export async function getDirForAppName(appName: string) {
  return `${await findWorkspaceDir()}/apps/${appName}`;
}

export async function getDirWithoutWorkspaceRootForDir(dir: string) {
  const workspaceRoot = await findWorkspaceDir();
  return dir.split(workspaceRoot)[1];
}
