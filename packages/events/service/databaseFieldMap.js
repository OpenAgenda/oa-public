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
  {
    db: 'creator_uid',
    obj: 'creatorUid',
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
    type: 'json',
    list: false
  },
  {
    db: 'keywords',
    obj: 'keywords',
    type: 'json'
  },
  {
    db: 'conditions',
    obj: 'conditions',
    type: 'json'
  },
  {
    db: 'image',
    obj: 'image',
    type: 'json'
  },
  {
    db: 'draft',
    obj: 'draft',
    list: false
  },
  {
    db: 'private',
    obj: 'private',
    list: false
  },
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
    db: 'deleted_at',
    obj: 'deletedAt',
    protected: true,
    internal: true,
    list: false
  },
  {
    db: 'agenda_uid',
    obj: 'agendaUid',
    protected: true,
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
  },
  {
    db: 'references',
    obj: 'references',
    type: 'json',
    list: false
  },
  {
    db: 'links',
    obj: 'links',
    type: 'json',
    list: false
  },
  {
    db: 'file_key',
    obj: 'fileKey',
    protected: true,
    list: false
  }
]
