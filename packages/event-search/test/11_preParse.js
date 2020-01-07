"use strict";

const should = require('should');
const preParse = require('../service/index/preParse');

describe('11 - event-search - unit: preParse', function() {

  it('title is flattened into an array', () => {
    preParse({
      title: {
        fr: 'Un titre',
        en: 'A title'
      }
    }).should.eql( {
      title: {
        fr: 'Un titre',
        en: 'A title'
      },
      search_internals_title: [
        'Un titre',
        'A title'
      ]
    });
  });

});
