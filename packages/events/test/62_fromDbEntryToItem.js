'use strict';

const assert = require('assert');
const fromDbEntryToItem = require('../lib/fromDbEntryToItem');

const entry = {
  uid: 80107389,
  slug: 'spectacle-les-ombres-racontent-kirikou-et-autres-histoires',
  timezone: 'Europe/Paris',
  draft: 0,
  updated_at: '2020-09-24T09:22:11.000Z',
  agenda_uid: 89904399,
  event_attendance_mode: 1,
  online_access_link: null,
  location_uid: 16496612,
  image: '{"filename":"950de3a396df447dbb66364d036e0067.base.image.jpg","credits":"MEL","size":{"height":344,"width":700},"variants":[{"type":"full","filename":"950de3a396df447dbb66364d036e0067.full.image.jpg","size":{"height":344,"width":700}},{"type":"thumbnail","filename":"950de3a396df447dbb66364d036e0067.thumb.image.jpg","size":{"height":200,"width":200}}]}',
  title: '{"fr":"ANNULÉ : Spectacle « Les ombres racontent : Kirikou et autres histoires »"}'
};

describe('fromItemToDbEntry', () => {
  let item;

  before(() => {
    item = fromDbEntryToItem({}, entry);
  });

  it('title is multilingual value', () => {
    assert.equal(item.title.fr, 'ANNULÉ : Spectacle « Les ombres racontent : Kirikou et autres histoires »');
  });

});
