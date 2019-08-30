import schema from '@openagenda/validators/schema';
import text from '@openagenda/validators/text';
import email from '@openagenda/validators/email';

schema.register({
  text,
  email
});

export default function validate(values) {
  const errors = {};

  try {
    schema({
      message: {
        type: 'text',
        optional: false
      },
      replyTo: {
        type: 'email',
        optional: true
      }
    })(values);
  } catch (e) {
    Object.assign(errors, ...e.map(v => ({ [v.field]: v.code })));
  }

  if (Object.keys(errors).length) {
    return errors;
  }

  return true;
}
