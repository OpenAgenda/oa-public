'use strict';

const _ = require('lodash');
const assert = require('assert');

const Service = require('../');
const config = require('../testconfig');
const states = require('../iso/states');

const fixtures = require('./fixtures');

const membersFixtures = require('./fixtures/members.json');
const sourceAgendasFixtures = require('./fixtures/sourceAgendas.json');


describe('agendaEvents - 01 - functional (server): list', function() {
  let svc;

  before(async () => {
    await fixtures(config.mysql, [
      'reset.sql',
      '../../model.sql',
      'agenda_event.data.sql'
    ]);
  });

  before(() => {
    svc = Service({
      ...config,
      interfaces: {
        ...config.interfaces,
        getMembers: async aes => aes.map(ae => _.find(membersFixtures, {
          agendaUid: ae.agendaUid,
          userUid: ae.userUid
        })).filter(ae => !!ae),
        getSourceAgendas: async sourceAgendaUids => sourceAgendasFixtures
          .filter(agenda => sourceAgendaUids.includes(agenda.uid))
      }
    });
  });

  it('simple list', async () => {
    const result = await svc(62792452).list(100, 10);

    assert.deepEqual(Object.keys(result), ['items', 'total']);
  });

  it('list with member decorate provides members for each returned item', async () => {
    const {
      items
    } = await svc(62792452).list(100, 10, { decorate: ['member'] });

    assert.equal(items.filter(i => i.member).length, 4);

    assert.deepEqual(
      items.filter(i => i.member)[0].member,
      {
        agendaUid: 62792452,
        userUid: 123,
        role: 2
      }
    );
  });

  it('list with sourceAgendas decorate provides source agendas for each returned item', async () => {
    const {
      items
    } = await svc(62792452).list(100, 10, {
      decorate: ['sourceAgendas']
    });

    assert.deepEqual(items[0].sourceAgendas, [
      { uid: 7878876, title: 'Papadapap' },
      { uid: 789679, title: 'Castoche' }
    ]);

    assert.deepEqual(items[7].sourceAgendas, [{
      uid: 5675765,
      title: 'Dièse'
    }]);
  });

  it('list filtered by state using code in query', async () => {
    const result = await svc(62792452).list({
      state: states.PUBLISHED
    }, 0, 10);

    assert.equal(result.total, 2);
  });

  it('query can be omitted', async () => {
    const result = await svc(62792452).list(0, 10);

    assert.equal(result.items.length, 10);
  });

  it('list filtered by state using string in query', async () => {
    const result = await svc(62792452).list({
      state: 'published'
    }, 0, 10);

    assert.equal(result.total, 2);
  });

  it('list filtered by aggregated boolean', async () => {
    const result = await svc(62792452).list({ aggregated: false }, 0, 0);

    assert.equal(result.total, 2);
  });

  it('total gives an integer equal to the total number of items', async () => {
    const result = await svc(62792452).list(100, 10);

    assert.equal(result.total, 2288);
  });

  it('list for several event uids', async () => {
    const result = await svc(62792452).list({
      eventUid: [54434612, 28028226]
    });

    assert.equal(result.items.length, 2);
  });

  it('filter on canEdit', async () => {
    const canEditItems = await svc(62792452).list({
      canEdit: true
    }, 0, 1).then(r => r.items);

    const cannotEditItems = await svc(62792452).list({
      canEdit: false
    }, 0, 1).then(r => r.items);

    const eitherItems = await svc(62792452).list({
      eventUid: [canEditItems[0].eventUid, cannotEditItems[0].eventUid]
    }).then(r => r.items);

    assert.equal(canEditItems[0].canEdit, true);
    assert.equal(cannotEditItems[0].canEdit, false);
    assert.equal(eitherItems.length, 2);
  });

  it('listByLastId for faster list', async () => {
    const result = await svc(62792452).listByLastId(0, 10);

    assert.equal(result.items.length, 10);

    const lastId = result.lastId;

    const next = await svc(62792452).listByLastId(lastId, 10);

    assert.equal(lastId, 437234);
    assert.equal(next.lastId, 437415);
  });

  it('list by event uid', async () => {
    const { items } = await svc.list.byEventUid(54434612, 0, 20);

    assert.equal(items.length, 1);
  });

  it('fix: aggregated is true if is referenced as such in db', async () => {
    const { items } = await svc.list.byEventUid(60059313, 0, 20);
    assert.equal(items[0].aggregated, true);
  });

  it('list by event uids', async () => {
    const { total } = await svc.list.byEventUid([54434612, 28028226], 0, 20);
    assert.equal(total, 2);   
  });

  it('list by event uid and filtering out agenda uid from results', async () => {
    const { items } = await svc.list.byEventUid(54434612, { excludeAgendaUid: 62792452 }, 0, 1);

    assert.equal(items.length ,0);  
  });

  it('list by event uid and filtering by canEdit', async () => {
    const { items } = await svc.list.byEventUid(54434612, { canEdit: true });
    assert.equal(items.length, 0);
  });

  it('updatedAt timestamp is in result of list', async () => {
    const { items } = await svc(62792452).list();
    assert(items[0].updatedAt instanceof Date);
  });

  it('an item contains agenda & event references, state, featured bool and custom data', async () => {

    const result = await svc(62792452).list(0, 1);

    assert.deepEqual(
      Object.keys(result.items[0]),
      [
        'eventUid',
        'agendaUid',
        'userUid',
        'aggregated',
        'sourcePaths',
        'featured',
        'canEdit',
        'state',
        'legacyId',
        'createdAt',
        'updatedAt'
      ]
    );

  });

});
