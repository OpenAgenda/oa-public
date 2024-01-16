import zxcvbn from 'zxcvbn';

const getMessageDetails = ({ score, length }) => {
  if (!length) {
    return {
      type: 'error',
      code: 'required',
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

  return {
    valid: score > 0,
    score,
    message: getMessageDetails({ score, length: password?.length }),
  };
}
