import schema from '../src/schema/index.js';

import textValidator from '../src/text.js';

schema.register({
  text: textValidator,
});

describe('related', () => {
  test('related.other values are passed on to validate function', () => {
    const relatedValues = {};

    schema.register({
      relatedTimings: (params) => (v, options) => {
        Object.assign(relatedValues, options.related);
        return 'timings';
      },
    });

    const validate = schema({
      timezone: {
        type: 'text',
      },
      timings: {
        type: 'relatedTimings',
        related: { other: ['timezone'] },
      },
    });

    validate({
      timezone: 'Europe/Paris',
      timings: 'not-important-for-the-test',
    });

    expect(relatedValues).toEqual({ timezone: 'Europe/Paris' });
  });
});
