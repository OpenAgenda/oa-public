import * as url from 'node:url';
import { readFile } from 'node:fs/promises';
import zxcvbn from 'zxcvbn';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const usualPasswords = await readFile(`${__dirname}usualPasswords.json`, 'utf8').then(JSON.parse);

const getMessageDetails = ({ score, length, isUsual, isSameAs }) => {
  if (!length) {
    return {
      type: 'error',
      code: 'required',
    };
  }

  if (isSameAs) {
    return {
      type: 'error',
      code: 'isSameAs',
    };
  }

  if (isUsual) {
    return {
      type: 'error',
      code: 'usual',
    };
  }
  if (score === 0) {
    return {
      type: 'error',
      code: 'tooWeak',
    };
  }

  const type = 'warning';

  if (score === 1) {
    return {
      type,
      code: 'weak',
    };
  }

  if (score === 2) {
    return { type, code: 'weakish' };
  }

  return {
    type: 'ok',
    code: score === 3 ? 'good' : 'great',
  };
};

export function evaluate(password, options = {}) {
  const {
    score,
  } = zxcvbn(password);

  const {
    identifiers = {},
  } = options;

  let valid = score > 0;

  const isSameAs = Object.keys(identifiers)
    .reduce(
      (is, field) => (identifiers[field] === password ? field : is),
      false,
    );

  if (isSameAs) {
    valid = false;
  }

  const isUsual = usualPasswords.includes(password);

  if (isUsual) {
    valid = false;
  }

  return {
    valid,
    score,
    isUsual,
    isSameAs,
    message: getMessageDetails({ score, length: password?.length, isUsual, isSameAs }),
  };
}
