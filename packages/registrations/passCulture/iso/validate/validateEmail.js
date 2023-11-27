import { BadRequest } from '@openagenda/verror';

export default function validateBookingContact(dirty, field) {
  if (!dirty) return;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dirty)) {
    throw new BadRequest({
      info: {
        errors: [{
          message: 'email is invalid',
          code: `registration.pass.${field}.invalid`,
          label: 'L\'email est invalide',
          field: field,
        }],
      },
    });
  }
  return dirty;
}
