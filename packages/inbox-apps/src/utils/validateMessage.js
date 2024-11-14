import schema from '@openagenda/validators/schema/index.js';
import text from '@openagenda/validators/text.js';

schema.register({
  text,
});

export default function validateMessage(data) {
  try {
    const validate = schema({
      body: {
        type: 'text',
        // min: 2,
        // max: 10000,
        optional: false,
      },
    });

    validate(data);
  } catch (errors) {
    return errors.reduce((result, v) => ({ ...result, [v.field]: v.code }), {});
  }
}
