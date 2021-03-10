'use strict';

const I18N = require('../utils/I18N');

describe('labels', () => {
  let i18n;

  beforeAll(() => {
    i18n = I18N(`${__dirname}/fixtures/labels`);
  });

  it('handlebars helper allows to get translated label', () => {
    const data = {
      root: {
        lang: 'fr',
      },
    };

    expect(i18n.handlebarsHelper('next', { data })).toEqual('Suivant');
  });
});
