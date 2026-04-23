import linkValidator from '@openagenda/validators/link.js';
import phoneValidator from '@openagenda/validators/phone.js';
import emailValidator from '@openagenda/validators/email.js';

const validates = {
  link: linkValidator(),
  phone: phoneValidator(),
  email: emailValidator(),
};

const validationErrors = (e) => [].concat(e);

const extractType = (value, options = {}) => {
  const { throwOnError = true } = options;
  for (const type of ['phone', 'email', 'link']) {
    try {
      validates[type](value);
      return type;
    } catch (e) {
      /* not of type */
    }
  }

  if (!throwOnError) {
    return null;
  }

  throw new Error('unknown registration type');
};

function toListOfObjects(v) {
  return []
    .concat(v)
    .filter((item) => ![null, undefined].includes(item))
    .map((item) =>
      (typeof item === 'string'
        ? {
          value: item,
          type: extractType(item, { throwOnError: false }),
        }
        : item));
}

const knownServices = ['passCulture'];

export default Object.assign(
  function validateRegistration(options = {}) {
    const { field, optional = true } = options;

    return (v) => {
      const items = toListOfObjects(v);

      if (!optional && items.length === 0) {
        throw validationErrors({
          code: 'required',
          message: 'value must not be empty',
          origin: v,
          ...field ? { field } : undefined,
        });
      }
      const result = items.reduce(
        ({ clean, errors }, item, index) => {
          const { type, value } = item;

          const cleanItem = { type };

          if (!type) {
            errors.push({
              field,
              code: 'registration.invalid',
              message: 'registration value must be a phone, an email or a link',
              origin: value,
              index,
            });
          } else {
            cleanItem.value = validates[type](value);
          }

          if (item.service) {
            if (!knownServices.includes(item.service)) {
              errors.push({
                index,
                origin: item.service,
                code: 'service.invalid',
                field,
              });
            }
            Object.assign(cleanItem, {
              service: item.service,
              data: item.data,
            });
          }

          if (item.lastProcessedAt) cleanItem.lastProcessedAt = item.lastProcessedAt;
          if (item.owner) cleanItem.owner = item.owner;

          return {
            errors,
            clean: clean.concat(cleanItem),
          };
        },
        { clean: [], errors: [] },
      );

      if (result.errors.length) {
        throw result.errors;
      }

      return result.clean;
    };
  },
  { toListOfObjects },
);
