'use strict';

const Service = require('..');
const config = require('../testconfig');
const fixtures = require('./fixtures');

describe('agendaEvents - functional (server): utils', function() {
  let svc;

  beforeAll(async () => {
    await fixtures(config.mysql, [
      'reset.sql',
      '../../model.sql',
      'agenda_event.data.sql'
   ]);
  });

  beforeAll(() => {
    svc = Service(config);
  });

  describe('setSourcePaths', () => {
    let result;

    beforeAll(async () => {
      result = await svc.utils.setSourcePaths(62792452, 16425580, [[123]]);
    });

    it('updated ref includes set source uid', () => {
      expect(result.updated.sourcePaths).toEqual([[123]]);
    });

    it('ref before did not include source uid', () => {
      expect(result.before.sourcePaths).toEqual([]);
    });
  });
});
