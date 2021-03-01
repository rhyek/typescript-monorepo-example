#!/usr/bin/env ts-node-transpile-only
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

function flattenSteps(obj: object) {
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'steps') {
      if (!Array.isArray(value)) {
        throw new Error(
          `Steps value is not an array: ${JSON.stringify(value, null, 2)}`,
        );
      }
      const flat = value.flat();
      value.splice(0, value.length, ...flat);
      break;
    } else if (typeof value === 'object' && value !== null) {
      flattenSteps(value);
    }
  }
}

async function main() {
  const srcDir = path.resolve(__dirname, './workflows');
  const files = await fs.readdir(srcDir);
  const outFiles: [string, string][] = [];
  const includeRegex = new RegExp(/( +)?!include\((.+)\)/);
  for (const file of files) {
    const srcFile = path.resolve(srcDir, file);
    let srcContent = await fs.readFile(srcFile, 'utf8');
    let match: RegExpMatchArray | null = null;
    while ((match = srcContent.match(includeRegex))) {
      const [matchedString, spaces, includePath] = match;
      const { index } = match;
      const realPath = includePath.match(/\.ya?ml$/)
        ? includePath
        : `${includePath}.yaml`;
      const includeContent = (
        await fs.readFile(path.resolve(path.dirname(srcFile), realPath), 'utf8')
      )
        .split('\n')
        .map((line) => `${spaces ?? ''}${line}`)
        .join('\n');
      srcContent =
        srcContent.substr(0, index! + (spaces ? spaces.length : 0)) +
        includeContent.trim() +
        srcContent.substr(index! + matchedString.length);
    }
    const outFile = path.resolve(__dirname, '../.github/workflows', file);
    const doc = yaml.load(srcContent);
    if (typeof doc !== 'object' || doc === null) {
      throw new Error(`Invalid type for document: ${typeof doc}`);
    }
    flattenSteps(doc);
    delete (doc as any).anchors;
    const dump = yaml.dump(doc, {
      noRefs: true,
    });
    outFiles.push([outFile, dump]);
  }
  if (outFiles.length > 0) {
    for (const [outFile, content] of outFiles) {
      await fs.writeFile(outFile, content, { encoding: 'utf8' });
    }
  }
}

if (require.main === module) {
  main();

  process.on('unhandledRejection', (error) => {
    throw error;
  });
}
