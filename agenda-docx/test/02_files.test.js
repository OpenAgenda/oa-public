import fs from 'node:fs';
import path from 'node:path';
import config from '../config.dev.js';
import AgendaFiles from '../server/lib/agendaFiles.js';

describe('unit - files', () => {
  const { setJSON, getJSON, get, set, remove } = AgendaFiles({
    s3: config.s3,
    bucket: config.s3.bucket,
    uid: 'test02',
  });

  test('set a json file, get it back, delete it', async () => {
    await remove('test.json');

    const json = await getJSON('test.json', { thisIsADefaultObject: true });

    expect(json).toEqual({ thisIsADefaultObject: true });

    await setJSON('test.json', { thisIsAnUploadedJSON: true });

    const json2 = await getJSON('test.json', null);

    expect(json2).toEqual({ thisIsAnUploadedJSON: true });

    await remove('test.json');

    const json3 = await getJSON('test.json', { defaultObjectAgain: true });

    expect(json3).toEqual({ defaultObjectAgain: true });
  });

  test('upload a file from local path, check it, delete it', async () => {
    const { localTmpPath } = config;

    const content = `content_${new Date().getTime()}`;

    fs.writeFileSync(`${localTmpPath}/test.txt`, content, 'utf-8');

    const { path: resultPath } = await set(
      `${localTmpPath}/test.txt`,
      'mytestfile.txt',
    );

    expect(resultPath).toEqual('test02/mytestfile.txt');
  });

  test('get a docx as a Buffer', async () => {
    await set(
      path.join(import.meta.dirname, 'data/template.docx'),
      'template.docx',
    );

    const templateContent = await get('template.docx');

    expect(templateContent).toBeInstanceOf(Buffer);
  });
});
