import axios from 'axios';
import { remark } from 'remark'
import strip from 'strip-markdown'
import gm from 'gm';

const imagick = gm.subClass({ imageMagick: true });

export function flatten(label, requestedLang, options = {}) {
  const {
    fallbackLang = 'fr',
  } = options;

  if (typeof label === 'string') return label;

  for (const lang of [requestedLang, fallbackLang, Object.keys(label || {}).shift()]) {
    if (label?.[lang]) return label[lang];
  }
};

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
    return stripped.substring(0, limit - 6) + ' (...)';
  }

  return stripped;
}

export function processImage(URL) {
  return new Promise((rs, rj) => axios
    .get(URL, {
      responseType: 'arraybuffer',
    })
    .then(response => imagick(response.data)
      .resize(800, 1200, '^')
      .gravity('Center')
      .crop(800, 1200)
      .toBuffer((err, resizedBuffer) => {
        if (err) {
          rj(err);
          return;
        }
        rs(resizedBuffer.toString('base64'));
      })
    ));
}