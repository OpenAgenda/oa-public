const path = require( 'path' );
const makeLabelGetter = require( '../utils/makeLabelGetter' );

module.exports = {
  templatesDir: process.env.MAILS_TEMPLATES_DIR || path.resolve( path.dirname( __dirname ), 'templates' ),
  defaults: {
    lang: 'en',
    data: {
      domain: 'https://openagenda.com'
    }
  },
  translations: {
    labels: {
      'helloWorld-i18n': {
        hello: {
          fr: 'Salut %username%',
          en: 'Hello %username%'
        },
        goToOA: {
          fr: 'Aller sur OpenAgenda',
          en: 'Go to OpenAgenda'
        }
      }
    },
    makeLabelGetter
  }
};
