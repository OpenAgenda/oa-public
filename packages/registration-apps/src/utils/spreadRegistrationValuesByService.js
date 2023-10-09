import isURL from 'validator/lib/isURL';
import isEmail from 'validator/lib/isEmail';

const isPhone = v => /^(\\+|)([\\d\\s\\.\\-]|\\([\\d\\s]\\))+$/.test(v);

const extractType = v => {
  if (isPhone(v)) {
    return 'phone';
  }
  if (isEmail(v)) {
    return 'email';
  }
  if (isURL(v)) {
    return 'link';
  }
  return 'error';
};

export default function spreadRegistrationValuesByService(value = []) {
  return (value || []).reduce((spread, v) => {
    const item = typeof v === 'string' ? {
      type: extractType(v),
      value: v,
    } : v;

    if (item.service === 'passCulture') {
      return {
        ...spread,
        passCulture: item.data,
      };
    }
    return {
      ...spread,
      standard: spread.standard.concat(item),
    };
  }, {
    standard: [],
    passCulture: null,
  });
}
