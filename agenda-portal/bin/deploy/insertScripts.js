import fs from 'node:fs';

export default (cwd) => {
  const fileStr = `${cwd}/package.json`;
  const packageStr = fs.readFileSync(fileStr, 'utf-8');

  fs.writeFileSync(
    fileStr,
    packageStr.replace(
      '"dependencies": {',
      `"scripts" : {
    "start": "start-portal",
    "prepack": "build-portal"
  },
  "dependencies": {`,
    ),
  );
};
