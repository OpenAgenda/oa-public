'use strict';

const should = require('should');

const Service = require('../');
const config = require('../testconfig');
const fixtures = require('./fixtures');

describe('agendaEvents - functional (server): utils', function() {
  let svc;

  before(async () => {
    await fixtures(config.mysql, [
      'reset.sql',
      'agenda_event.create.sql',
      'agenda_event.data.sql'
   ]);
  });

  before(() => {
    svc = Service(config);
  });

  describe('setSourcePaths', () => {
    let result;

    before(async () => {
      result = await svc.utils.setSourcePaths(62792452, 16425580, [[123]]);
    });

    it('updated ref includes set source uid', () => {
      result.updated.sourcePaths.should.eql([[123]]);
    });

    it('ref before did not include source uid', () => {
      result.before.sourcePaths.should.eql([]);
    });
  });

});
