// 1. Build & download .zip on Crowdin (https://crowdin.com/project/openagenda)
// 2. Unzip the archive content in `archive` folder
// 3. Run `node dispatch.js`
// 4. Need to run `node dispatch.js` in packages/labels/.crowdin

const fs = require('fs');
const path = require('path');

const PROJECT = path.resolve(__dirname, '../..');
const ARCHIVE = path.resolve(__dirname, 'archive');

const rootsMap = new Map([
  ['[OpenAgenda.oa] main', '.'],
  ['[OpenAgenda.oa-public] main', 'public'],
]);

function walkSync(dir, basePath = __dirname) {
  const files = fs.readdirSync(path.join(basePath, dir));
  const results = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(path.join(basePath, filePath));

    if (stat && stat.isDirectory()) {
      Array.prototype.push.apply(results, walkSync(filePath, basePath));
    } else {
      results.push(filePath);
    }
  }

  return results;
}

for (const [archive, root] of rootsMap) {
  const files = walkSync('.', path.join(ARCHIVE, archive));

  for (const file of files) {
    const crowdinLabels = require(path.join(ARCHIVE, archive, file));
    let rawProjectLabels = '';

    try {
      rawProjectLabels = fs.readFileSync(path.join(PROJECT, root, file), 'utf-8');
    } catch (e) {
      console.log(`File '${file}' does not exists in project`);
    }

    const start = rawProjectLabels.slice(0, rawProjectLabels.indexOf('{'));
    const end = rawProjectLabels.slice(rawProjectLabels.lastIndexOf('}') + 1);
    const projectLabels = JSON.parse(rawProjectLabels);

    const labels = {
      ...projectLabels,
      ...crowdinLabels,
    };

    fs.writeFileSync(path.join(PROJECT, root, file), `${start}${JSON.stringify(labels, null, 2)}${end}`);
  }
}
