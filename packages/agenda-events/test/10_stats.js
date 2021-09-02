'use strict';

const should = require('should');

const Service = require('../');
const config = require('../testconfig');
const fixtures = require('./fixtures');

describe('agendaEvents - functional (server): stats', function() {
  let svc;

  before(async () => {
    await fixtures(config.mysql, [
      'reset.sql',
      '../../model.sql',
      'agenda_event.data.sql'
   ]);
  });

  before(() => {
    svc = Service(config);
  });

  it('countByUserUid (unrestricted)', async () => {
    const counts = await svc(62792452).stats.countByUserUid();

    counts.should.eql([{
      count: 2283, userUid: null
    }, {
      count: 2, userUid: 123
    }, {
      count: 2, userUid: 456
    }, {
      count: 1, userUid: 12312312
    }]);
  });

  it('countByUserUid (for specific user uids)', async () => {
    const counts = await svc( 62792452 ).stats.countByUserUid( [ 12312312 ] );

    counts.should.eql( [ {
      count: 1, userUid: 12312312
    } ] );

  });

} );
