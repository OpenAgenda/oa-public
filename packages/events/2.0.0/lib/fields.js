'use strict';

module.exports = [{
  field: 'id',
  optional: false,
  fieldType: 'integer',
  read: ['internal'],
  write: ['internal']
}, {
  field: 'uid',
  fieldType: 'integer',
  optional: false,
  read: ['internal', 'public', "list"],
  write: ['internal']
},  {
  field: 'slug',
  fieldType: 'text',
  optional: false,
  read: ['internal', 'public'],
  write: ['internal']
}, {
  field: 'private',
  fieldType: 'boolean',
  default: false,
  read: ['internal'],
  write: ['internal']
}, {
  field: 'timezone',
  fieldType: 'text',
  default: 'Europe/Paris',
  read: ['public'],
  write: ['internal', 'public']
}, {
  field: 'draft',
  fieldType: 'boolean',
  default: false,
  read: ['public'],
  write: ['internal']
}, {
  field: 'updatedAt',
  optional: false,
  fieldType: 'date',
  read: ['internal', 'public'],
  write: ['internal']
}, {
  field: 'createdAt',
  optional: false,
  fieldType: 'date',
  read: ['internal'],
  write: ['internal']
}, {
  field: 'creatorUid',
  fieldType: 'integer',
  write: ['internal']
}, {
  field: 'ownerUid',
  fieldType: 'integer',
  write: ['internal']
}, {
  field: 'agendaUid',
  fieldType: 'integer',
  optional: false,
  read: ['public'],
  write: ['internal']
}, {
  field: 'fileKey',
  fieldType: 'text',
  read: ['internal'],
  write: ['internal']
}, {
  field: 'eventAttendanceMode',
  fieldType: 'radio',
  optional: false,
  unique: true,
  default: 1,
  options: [{
    id: 1,
    value: 'offline'
  }, {
    id: 2,
    value: 'online'
  }, {
    id: 3,
    value: 'mixed'
  }],
  read: ['public'],
  write: ['internal', 'public']
}, {
  field: 'onlineAccessLink',
  fieldType: 'link',
  optional: false,
  enableWith: {
    field: 'eventAttendanceMode',
    value: [2, 3]
  },
  read: ['public'],
  write: ['internal', 'public']
}, {
  field: 'locationUid',
  fieldType: 'integer',
  enableWith: {
    field: 'eventAttendanceMode',
    value: [1, 3]
  },
  optional: false,
  read: ['internal', 'public'],
  write: ['internal', 'public']
}, {
  field: 'image',
  fieldType: 'stream',
  read: ['internal', 'public'],
  write: ['internal', 'public'],
  db: {
    type: 'json',
    field: 'image'
  }
}, {
  field: 'imageCredits',
  fieldType: 'text',
  "max": 255,
  enableWith: 'image',
  write: ['internal', 'public'],
  read: ['internal', 'public'],
  db: {
    type: 'json',
    field: 'image.credits'
  }
}, {
  field: 'title',
  "languages": [],
  fieldType: 'text',
  optional: false,
  "max" : 140,
  write: ['internal', 'public'],
  read: ['public'],
  db: {
    type: 'json'
  }
}, {
  field: 'description',
  "languages" : [],
  fieldType: 'text',
  optional: false,
  "max" : 200,
  write: ['internal', 'public'],
  read: ['internal', 'public'],
  db: {
    type: 'json'
  }
}, {
  field: 'longDescription',
  "languages": [],
  fieldType: 'text',
  optional: true,
  "max": 10000,
  write: ['internal', 'public'],
  read: ['internal', 'public'],
  db: {
    type: 'json'
  }
}, {
  field: 'keywords',
  fieldType: 'keywords',
  optional: true,
  "max": 255,
  write: ['internal', 'public'],
  db: {
    type: 'json'
  }
}, {
  field: 'conditions',
  "languages": [],
  optional: true,
  write: ['internal', 'public'],
  db: {
    type: 'json'
  }
}, {
  field: 'age',
  fieldType: 'age',
  write: ['internal', 'public'],
  db: {
    type: 'json'
  }
}, {
  field: 'registration',
  fieldType: 'registration',
  write: ['internal', 'public'],
  db: {
    type: 'json'
  }
}, {
  field: 'accessibility',
  fieldType: 'accessibility',
  write: ['internal', 'public'],
  db: {
    type: 'json'
  }
}, {
  field: 'timings',
  fieldType: 'timings',
  optional: false,
  read: ['internal', 'public'],
  write: ['internal', 'public'],
  db: {
    type: 'json'
  }
}, {
  field: 'references',
  fieldType: 'integer',
  list: true,
  write: ['internal', 'public'],
  db: {
    type: 'json'
  }
}, {
  field: 'links',
  fieldType: 'enrichedLinks',
  db: {
    type: 'json'
  }
}].map(f => {
  f.label = f.field;
  if (f.options) {
    f.options = f.options.map(o => ({ ...o, label: o.value }))
  }
  return f;
});
