import fs from 'node:fs/promises';

export default async function copyAndEditFile(src, destPath, edits = {}) {  
  const srcPath = `${process.env.PWD}/${src}`;
  const filename = src.split('/').pop();
  let content = await fs.readFile(srcPath, 'utf-8');
  
  Object.keys(edits).forEach(name => {
    content = content.replace(
      new RegExp(['\\\${', name, '\\\}'].join(''), 'g'),
      edits[name]
    );
  });

  await fs.writeFile(destPath, content, 'utf-8');
}