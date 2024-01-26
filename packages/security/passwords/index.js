import zxcvbn from 'zxcvbn';
import * as url from 'node:url';
import { readFile } from 'node:fs/promises';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const usualPasswords = await readFile(`${__dirname}usualPasswords.json`, 'utf8').then(JSON.parse);

const getMessageDetails = ({ score, length, isUsual }) => {
  if (!length) {
    return {
      type: 'error',
      code: 'required',
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

export function evaluate(password) {
  const {
    score,
  } = zxcvbn(password);

  const isUsual = usualPasswords.includes(password);
  return {
    valid: isUsual ? false : score > 0,
    score,
    isUsual,
    message: getMessageDetails({ score, length: password?.length, isUsual }),
  };
}
