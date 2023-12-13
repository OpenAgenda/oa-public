'use strict';

const _ = require('lodash');

const Service = require('..');
const config = require('../testconfig');
const fixtures = require('./fixtures');

describe.only('agenda-events - 07 - transferToLegacy - transfer to legacy', function() {
  let svc;

  const knex = require('knex')({
    client: 'mysql',
    connection: config.mysql
  });

  beforeAll(async () => {
    await fixtures(config.mysql, [
      'reset.sql',
      '../../model.sql',
      'agenda_event.data.sql',
      'legacy_agenda_event.data.sql',
      'legacy_event_editor.data.sql',
      'legacy_agenda.data.sql',
      'legacy_event.data.sql',
      'legacy_user.data.sql'
    ]);

    svc = Service(config);
  });

  describe('creating a legacy record', () => {

    const agenda = { uid: 62792452, id: 4608 };
    const event = { uid: 43393864, id: 190092 };

    let beforeCreate, afterCreate, ae;

    beforeAll(async () => {
      ae = (await svc(agenda.uid).create(event.uid)).created;

      beforeCreate = await knex('review_article')
        .first('id').where({
          event_id: event.id,
          review_id: agenda.id
        });
    });

    beforeAll(async () => {
      await svc.legacyTransfer.to(ae);
    });

    beforeAll(async () => {
      afterCreate = await knex('review_article')
        .first().where({
          event_id: event.id,
          review_id: agenda.id
        });
    });

    it('creates legacy record when not previously existing', () => {
      expect(beforeCreate).not.toBeTruthy();

      expect(afterCreate).toBeTruthy();
    });

    it('legacy record is marked as published if ae is published', () => {
      expect(_.pick(afterCreate, ['state', 'is_published'])).toEqual({
        state: 2,
        is_published: 1
      });
    });

    it('agenda_event reference stores legacy id', async () => {
      const updatedRef = await svc(agenda.uid).get(event.uid);

      expect(
        updatedRef.legacyId
      ).toBe(agenda.id + '.' + event.id);
    });

  });

  describe('other', () => {

    it('adds user reference when specified', async () => {
      const { created } = await svc(62792452 /* id: 4608 */).create(43393865 /* id: 190093 */, { userUid: 98842070 });

      await svc.legacyTransfer.to(created);

      const after = await knex('review_article')
        .first().where({
          event_id: 190093,
          review_id: 4608
        });

      expect(after.user_id).toEqual(1909);
    });

    it('updates record when existing', async () => {
      const { updated } = await svc(62792452).update(53117383, { state: 2 });

      const before = await knex('review_article').first().where({
        event_id: 81631,
        review_id: 4608
      });

      await svc.legacyTransfer.to(updated);

      const after = await knex('review_article').first().where({
        event_id: 81631,
        review_id: 4608
      });

      expect(_.pick(before, ['is_published', 'state'])).toEqual({
        state: 1,
        is_published: 0
      });

      expect(_.pick(after, ['is_published', 'state'])).toEqual({
        state: 2,
        is_published: 1
      });
    });

    it('updates record when existing and has legacy id', async () => {
      const { updated } = await svc(62792452).update(10974548, { featured: 1 });

      expect(updated.featured).toEqual(true);
    });

    it('removes record', async () => {
      const before = await knex('review_article')
        .first()
        .where({ event_id: 81631, review_id: 4608 });

      await svc.legacyTransfer.remove({
        eventUid: 53117383,
        agendaUid: 62792452
      });

      const after = await knex('review_article')
        .first()
        .where({
          event_id: 81631,
          review_id: 4608
        });
    });

    it('updates featured value', async () => {
      await svc(62792452).remove(43393865);

      const { created } = await svc(62792452).create(43393865, {
        userUid: 98842070,
        featured: true
      });

      await svc.legacyTransfer.to(created);

      const after = await knex('review_article').first().where({
        event_id: 190093,
        review_id: 4608
      });

      expect(after.featured).toEqual(1);
    });

    it('adds event_editor entry if edition right is not set', async () => {

      await svc(62792452).remove(43393865);

      const { created } = await svc(62792452).create(43393865, { canEdit: true });

      await svc.legacyTransfer.to(created);

      const after = await knex('event_editor').first().where({
        event_id: 190093,
        review_id: 4608
      });

      expect(_.omit(after, ['created_at', 'updated_at'])).toEqual({
        type: 1,
        event_id: 190093,
        review_id: 4608
      });

    });

    it('removes event_editor entry if edition right is set', async () => {

      const { updated } = await svc(62792452).update(6973928, { canEdit: false });

      await svc.legacyTransfer.to(updated);

      const after = await knex('event_editor').first().where({
        event_id: 81824,
        review_id: 4608
      });

      expect(after).toBeUndefined();

    });

  });

});
