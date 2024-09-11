'use strict';

const Service = require('../service');
const config = require('./config');
const listInterface = require('./app/listInterface');
const getDetailedAgenda = require('./app/getDetailedAgenda');

describe('02 - Indexed and not indexed', () => {
  let svc;
  beforeAll(() => {
    svc = Service({
      elasticsearch: config.elasticsearch,
      alias: config.alias,
      listAgendas: listInterface('indexed', 100),
      getDetailedAgenda: getDetailedAgenda('indexed'),
    });
  });

  beforeAll(() => svc.rebuild());

  it('only indexed agendas are returned by default', async () => {
    const { agendas } = await svc(
      {},
      {},
      {
        includeFields: 'indexed',
        access: 'internal',
      },
    );

    agendas.forEach((agenda) => {
      expect(agenda.indexed).toEqual(true);
    });
  });

  it('if indexed option is null, both indexed and unindexed are returned', async () => {
    const { agendas } = await svc(
      {},
      {},
      { includeFields: 'indexed', indexed: null, access: 'internal' },
    );

    expect(agendas.filter((a) => a.indexed).length > 0).toBeTruthy();
    expect(agendas.filter((a) => !a.indexed).length > 0).toBeTruthy();
  });
});
