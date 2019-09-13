"use strict";

const _ = require( 'lodash' );
const mysql = require( 'mysql' );
const should = require( 'should' );

const svc = require( './service' );

const config = require( '../testconfig' );


describe('agendaEvents - functional (server): update', function() {
  this.timeout(5000);

  before(done => {
    svc.initAndLoad(config, done);
  } );

  afterEach(() => {
    svc.init(config);
  } );

  describe('setSourceUid', () => {
    let result;

    before(async () => {
      result = await svc.utils.setSourceUid(62792452, 10974548, 123);
    });

    it('updated ref includes set source uid', () => {
      result.updated.sourceAgendaUid.should.eql([123]);
    });

    it('ref before did not include source uid', () => {
      result.before.sourceAgendaUid.should.eql([]);
    });
  });

  describe('unsetSourceUid', () => {
    let result;

    before(async () => {
      result = await svc.utils.unsetSourceUid(62792452, 60059313, 22);
    });

    it('updated ref excludes unset source uid', () => {
      result.updated.sourceAgendaUid.should.eql([11,33]);
    });

    it('ref before included unset source uid', () => {
      result.before.sourceAgendaUid.should.eql([11,22, 33]);
    });
  });

});
