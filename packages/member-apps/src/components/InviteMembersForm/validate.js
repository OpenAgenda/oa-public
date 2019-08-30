import schema from '@openagenda/validators/schema';
import number from '@openagenda/validators/number';
import email from '@openagenda/validators/email';

schema.register({
  number,
  email
});

export default function validate(values) {
  const errors = {};

  const emails = values.emails
    && values.emails
      .split(/[\s\n,]+/)
      .map(v => v.trim())
      .filter(v => !!v);

  try {
    schema({
      role: {
        type: 'number',
        optional: false,
        min: 1,
        max: 4
      },
      emails: {
        type: 'email',
        optional: false,
        list: true
      }
    })({ ...values, emails });
  } catch (e) {
    Object.assign(errors, ...e.map(v => ({ [v.field]: v.code })));
  }

  if (errors.emails && values.emails && values.emails.length > 1) {
    errors.emails = 'emails.invalid';
  }

  if (Object.keys(errors).length) {
    return errors;
  }
}
