"use strict";

module.exports = [
  {
    db: 'id',
    obj: 'id',
    internal: true,
    protected: true
  },
  {
    db: 'owner_uid',
    obj: 'ownerUid',
    internal: true,
    protected: true,
    list: false
  },
  'slug',
  {
    db: 'uid',
    obj: 'uid',
    protected: true
  },
  {
    db: 'title',
    obj: 'title',
    type: 'json'
  },
  {
    db: 'description',
    obj: 'description',
    type: 'json'
  },
  {
    db: 'long_description',
    obj: 'longDescription',
    type: 'json'
  },
  {
    db: 'keywords',
    obj: 'keywords',
    type: 'json'
  },
  'image',
  {
    db: 'image_credits',
    obj: 'imageCredits'
  },
  'draft',
  'private',
  'timezone',
  {
    db: 'timings',
    obj: 'timings',
    type: 'json',
    list: false
  },
  {
    db: 'updated_at',
    obj: 'updatedAt'
  },
  {
    db: 'created_at',
    obj: 'createdAt'
  },
  {
    db: 'agenda_uid',
    obj: 'agendaUid',
    internal: true,
    list: false
  },
  {
    db: 'location_uid',
    obj: 'locationUid'
  },
  {
    db: 'accessibility',
    obj: 'accessibility',
    type: 'json'
  },
  {
    db: 'age',
    obj: 'age',
    type: 'json'
  },
  {
    db: 'registration',
    obj: 'registration',
    type: 'json'
  }
]