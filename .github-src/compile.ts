import fs from 'fs';
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

const srcDir = path.resolve(__dirname, './workflows');
const files = fs.readdirSync(srcDir);
const outFiles = [];
for (const file of files) {
  const srcFile = path.resolve(srcDir, file);
  const outFile = path.resolve(__dirname, '../.github/workflows', file);
  const doc = yaml.load(fs.readFileSync(srcFile, 'utf8'));
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
    fs.writeFileSync(outFile, content, { encoding: 'utf8' });
  }
}
