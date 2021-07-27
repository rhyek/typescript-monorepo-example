#!/usr/bin/env ts-node-transpile-only
import fs from 'fs/promises';
import 'colors';
import parseArgs from 'minimist';
import Handlebars from 'handlebars';
import { needsBuild } from '../needs-build';
import { getDirForAppName } from '../common/app-name-utils';
import { remoteImageExists } from './remote-image-exists';

type Options = {
  repository: string;
  image: string;
  tag: string;
  deps: null | string[];
  pipeLogs?: boolean;
  debug?: boolean;
};

// prettier-ignore
const dockerComposeTemplate =
`services:
  {{#deps}}
  {{appName}}:
    image: {{../repository}}/{{image}}:{{tag}}
  {{/deps}}
`;

// strategy is to see if sut package changed or any of its
// dependencies were built
async function prepareE2EIfNeeded(appName: string, options: Options) {
  const { repository, image, tag, deps } = options;
  const sutChanged = await needsBuild(appName);
  let anyDepChanged = false;
  if (deps) {
    const templateData = { repository, deps: [] as any[] };
    for (const dep of deps) {
      const depImage = image.replace(appName, dep);
      let depTag: string;
      if (await remoteImageExists(repository, depImage, tag)) {
        anyDepChanged = true;
        depTag = tag;
      } else {
        depTag = 'latest';
      }
      templateData.deps.push({ appName: dep, image: depImage, tag: depTag });
    }
    const composeContent = Handlebars.compile(dockerComposeTemplate)(
      templateData,
    );
    const sutDir = await getDirForAppName(appName);
    const composeFile = `${sutDir}/test/docker-compose.ci.yaml`;
    await fs.writeFile(composeFile, composeContent, 'utf8');
    console.error('Created', composeFile);
    console.error(composeContent);
  }
  const prepared = sutChanged || anyDepChanged;
  return prepared;
}

if (require.main === module) {
  async function main() {
    const argv = parseArgs(process.argv.slice(2), { string: ['deps'] });
    const [appName] = argv._;
    const { repository, image, tag, deps } = argv;
    const finalDeps = deps
      ? (deps as string).split(',').filter((d: string) => d)
      : null;
    const prepared = await prepareE2EIfNeeded(appName, {
      repository,
      image,
      tag,
      deps: finalDeps,
    });
    console.log(prepared ? 'true' : 'false');
  }
  main();

  process.on('unhandledRejection', (error) => {
    throw error;
  });
}
