import fs from 'node:fs/promises';
import axios from 'axios';
import { remark } from 'remark';
import strip from 'strip-markdown';
import gm from 'gm';

import { flatten } from '../iso/utils.js';

export * from '../iso/utils.js';

const imagick = gm.subClass({ imageMagick: true });

export async function formatText(value, options = {}) {
  const {
    lang = 'fr',
    limit = 1000,
  } = options;

  const stripped = await remark()
    .use(strip)
    .process(flatten(value, lang))
    .then(f => String(f));

  if (limit && stripped.length > limit) {
    return `${stripped.substring(0, limit - 6)} (...)`;
  }

  return stripped;
}

export async function processImage({ url, path }) {
  const input = await (url ? axios.get(url, {
    responseType: 'arraybuffer',
  }).then(r => r.data) : fs.readFile(path));

  return new Promise((rs, rj) => {
    imagick(input).resize(800, 1200, '^')
      .gravity('Center')
      .crop(800, 1200)
      .toBuffer((err, buffer) => {
        if (err) {
          rj(err);
          return;
        }

        rs(buffer.toString('base64'));
      });
  });
}
