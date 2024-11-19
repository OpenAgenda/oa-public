import I18N from '../utils/I18N.js';

describe('labels', () => {
  let i18n;

  beforeAll(async () => {
    i18n = await I18N(`${import.meta.dirname}/fixtures/labels`);
  });

  it('handlebars helper allows to get translated label', () => {
    const data = {
      root: {
        lang: 'fr',
      },
    };

    expect(i18n.handlebarsHelper('next', { data })).toEqual('Suivant');
  });

  it('handlebars helper allows to get message', () => {
    const data = {
      root: {
        lang: 'fr',
      },
      hash: true, // values === true returns no translated message
    };

    expect(i18n.handlebarsHelper('total', { data })).toEqual(
      '{total} événements',
    );
  });
});
