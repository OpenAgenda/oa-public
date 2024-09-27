import { BadRequest } from '@openagenda/verror';

export default function validateEmail(dirty, field, options = {}) {
  const { optional } = options;

  if (!dirty && optional) return;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dirty)) {
    throw new BadRequest({
      info: {
        errors: [
          {
            message: 'email is invalid',
            code: `registration.pass.${field}.invalid`,
            label: "L'email est invalide",
            field,
          },
        ],
      },
    });
  }
  return dirty;
}
