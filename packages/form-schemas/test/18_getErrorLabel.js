'use strict';

import should from 'should';
import getErrorLabel from '../client/src/iso/getErrorLabel';

describe('18 - unit - getErrorLabel', () => {

  it('given a set of labels and an error code, returns a rendered error text', () => {
    const errorLabels = {
      'string.toolong': 'Le champ doit comporter au plus %max% caractères',
      'link.invalid': 'Un lien valide doit être renseigné'
    };

    const field = {
      max: 100
    };

    const error = {
      code: 'string.toolong',
      message: 'this string is too long' // fallback
    };

    const rendered = getErrorLabel(errorLabels, field, error);

    rendered.should.equal('Le champ doit comporter au plus 100 caractères');
  });

});
