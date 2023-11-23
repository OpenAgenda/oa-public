import { BadRequest } from '@openagenda/verror';

export default function validateBookingContact(dirty) {
  if (!dirty) return;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dirty)) {
    throw new BadRequest({
      info: {
        errors: [{
          message: 'email is invalid',
          code: 'registration.pass.bookingContact.invalid',
          label: 'L\'email est invalide',
          field: 'bookingContact',
        }],
      },
    });
  }
  return dirty;
}
