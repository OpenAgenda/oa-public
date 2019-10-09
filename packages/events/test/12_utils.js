"use strict";

const should = require('should');
const utils = require('./service').utils;

describe('functional (server): utils', () => {

  describe('registrationByType', () => {

    it('distributes registration values according to their types', () => {
      const byType = utils.registrationByType([
        '01 09 09183',
        'romain@oa.com',
        'https://link.com',
        'https://otherlink.com',
        'email@email.com'
      ]);

      byType.should.eql({
        link: [ 'https://link.com', 'https://otherlink.com' ],
        phone: [ '01 09 09183' ],
        email: [ 'romain@oa.com', 'email@email.com' ]
      });
    });

    it('if nothing is given, returns empty arrays', () => {
      const byType = utils.registrationByType();

      byType.should.eql({
        link: [],
        phone: [],
        email: []
      });
    });

    it('if null is given, returns empty arrays', () => {
      const byType = utils.registrationByType(null);

      byType.should.eql({
        link: [],
        phone: [],
        email: []
      });
    });

  });

});
