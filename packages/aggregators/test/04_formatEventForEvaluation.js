'use strict';

const should = require('should');

const formatEventForEvaluation = require('../lib/formatEventForEvaluation');

const fixtures = {
  jepHDF: require('./fixtures/evaluate.jep-2019-hauts-de-france.1567920231125.13275141.json'),
  jepO: require('./fixtures/evaluate.jep-2019-occitanie.1567919994030.48353388.json')
}

describe('formatEventForEvaluation', () => {

  it('tags key is generated for rules evaluation', () => {
    const formatted = formatEventForEvaluation({
      formSchemas: fixtures.jepHDF.formSchemas
    }, {
      event: {},
      custom: {},
      networkCustom: {
        'types-devenement': 5,
        'theme-2019': [],
        'conditions-de-participation': [15]
      }
    });

    formatted.tags.should.eql(['Concert', 'Sur inscription']);
  });

  it('data that is not part of taggable fields is ignored', () => {
    const formatted = formatEventForEvaluation({
      formSchemas: fixtures.jepO.formSchemas
    }, {
      event: fixtures.jepO.event,
      custom: fixtures.jepO.custom,
      networkCustom: fixtures.jepO.networkCustom
    });

    formatted.tags.should.eql([
      'Offre pass culture : cet évènement est spécifiquement pensé pour les jeunes de 18 ans. Je souhaite qu’il soit référencé sur le pass Culture. En cochant cette case, j’accepte l’utilisation de ces données par le pass Culture ainsi que les conditions générales d’utilisation de la plateforme : https://docs.passculture.app',
      'Atelier / Démonstration / Savoir-faire',
      'Tarif habituel'
    ]);
  });

});
