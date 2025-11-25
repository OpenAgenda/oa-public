import fs from 'node:fs/promises';
import ky from 'ky';
import { remark } from 'remark';
import strip from 'strip-markdown';
import gm from 'gm';

import { flatten } from '../iso/utils.js';

export * from '../iso/utils.js';

const imagick = gm.subClass({ imageMagick: true });

export async function formatText(value, options = {}) {
  const { lang = 'fr', limit = 1000, markdownToString = true } = options;

  const stripped = markdownToString
    ? await remark()
      .use(strip)
      .process(flatten(value, lang))
      .then((f) => String(f))
    : value;

  if (limit && stripped.length > limit) {
    return `${stripped.substring(0, limit - 6)} (...)`;
  }

  return stripped;
}

export async function processImage({ url, path }) {
  const input = url
    ? Buffer.from(await ky.get(url).arrayBuffer())
    : await fs.readFile(path);

  return new Promise((rs, rj) => {
    imagick(input)
      .resize(800, 1200, '^')
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

function extractPropertyValues(property) {
  if (property.anyOf) {
    return property.anyOf
      .filter((f) => f.$ref.indexOf('TiteliveMusicTypeEnum') === -1)
      .pop()
      .$ref.split('/')
      .pop();
  }
  return property.$ref.split('/').pop();
}

export function extractSchemaOptions(openAPIObj, schema, key, relatedKey) {
  const relatedSchemas = openAPIObj.components.schemas[schema].properties[relatedKey].discriminator
    .mapping;

  return Object.keys(relatedSchemas).map((value) => {
    const obj = openAPIObj.components.schemas[relatedSchemas[value].split('/').pop()];

    return {
      value,
      label: obj.description,
      related: obj.required
        .filter((r) => r !== key)
        .map((r) => extractPropertyValues(obj.properties[r])),
    };
  });
}
