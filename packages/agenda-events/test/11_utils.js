'use strict';

const _ = require( 'lodash' );
const mysql = require( 'mysql' );
const should = require( 'should' );

const svc = require( './service' );

const config = require( '../testconfig' );


describe('agendaEvents - functional (server): utils', function() {
  this.timeout(5000);

  before(done => {
    svc.initAndLoad(config, done);
  } );

  afterEach(() => {
    svc.init(config);
  });

  describe('setSourcePaths', () => {
    let result;

    before(async () => {
      result = await svc.utils.setSourcePaths(62792452, 10974548, [[123]]);
    });

    it('updated ref includes set source uid', () => {
      result.updated.sourcePaths.should.eql([[123]]);
    });

    it('ref before did not include source uid', () => {
      result.before.sourcePaths.should.eql([]);
    });
  });

});
