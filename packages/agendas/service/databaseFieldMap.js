"use strict";

module.exports = [
  {
    db: 'id',
    obj: 'id',
    internal: true,
    protected: true
  },
  {
    db: 'owner_id',
    obj: 'ownerId',
    internal: true,
    protected: true,
    list: false
  },
  {
    db: 'member_schema_id',
    obj: 'memberSchemaId',
    list: false,
    internal: true,
    protected: true,
  },
  {
    db: 'form_schema_id',
    obj: 'formSchemaId',
    internal: true,
    protected: true,
    list: false
  },
  {
    db: 'network_uid',
    obj: 'networkUid',
    protected: true,
    list: false
  },
  {
    db: 'location_set_uid',
    obj: 'locationSetUid',
    protected: true,
    list: true
  },
  'slug',
  {
    db: 'uid',
    obj: 'uid',
    protected: true
  },
  {
    db: 'official',
    obj: 'official',
    protected: true
  },
  'title',
  'description',
  'url',
  'image',
  {
    db: 'updated_at',
    obj: 'updatedAt'
  },
  {
    db: 'created_at',
    obj: 'createdAt'
  },
  {
    db: 'officialized_at',
    obj: 'officializedAt',
    internal: true,
    protected: true
  },
  {
    db: 'settings',
    obj: 'settings',
    type: 'json',
    list: false
  },
  {
    db: 'private',
    obj: 'private',
    protected: true
  },
  {
    db: 'indexed',
    obj: 'indexed'
  },
  {
    db: 'credentials',
    obj: 'credentials',
    type: 'json',
    internal: true,
    protected: true,
    list: false
  },
  {
    db: 'store',
    obj: 'legacyStore',
    type: 'json',
    internal: true,
    protected: true,
    list: false
  }
];
