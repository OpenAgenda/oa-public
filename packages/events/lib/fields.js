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
  read: ['internal', 'public'],
  write: ['internal']
}, {
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
  fieldType: 'timezone',
  default: 'Europe/Paris',
  read: ['internal', 'public'],
  write: ['internal', 'public']
}, {
  field: 'draft',
  fieldType: 'boolean',
  default: false,
  read: ['internal', 'public'],
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
  read: ['internal'],
  write: ['internal']
}, {
  field: 'ownerUid',
  fieldType: 'integer',
  read: ['internal'],
  write: ['internal']
}, {
  field: 'agendaUid',
  fieldType: 'integer',
  optional: false,
  read: ['internal', 'public'],
  write: ['internal']
}, {
  field: 'fileKey',
  fieldType: 'text',
  read: ['internal'],
  write: ['internal']
}, {
  field: 'attendanceMode',
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
  read: ['internal', 'public'],
  write: ['internal', 'public']
}, {
  field: 'onlineAccessLink',
  fieldType: 'link',
  optional: false,
  enableWith: {
    field: 'attendanceMode',
    value: [2, 3]
  },
  read: ['internal', 'public'],
  write: ['internal', 'public']
}, {
  field: 'locationUid',
  fieldType: 'integer',
  optionalWith: {
    field: 'attendanceMode',
    value: 2
  },
  read: ['internal', 'public'],
  write: ['internal', 'public']
}, {
  field: 'image',
  fieldType: 'stream',
  allowNull: true,
  allowObject: true,
  optional: true,
  read: ['internal', 'public'],
  write: ['internal', 'public'],
  db: {
    type: 'json',
    field: 'image',
    assign: true
  }
}, {
  field: 'imageCredits',
  fieldType: 'text',
  max: 255,
  enableWith: 'image',
  default: null,
  optional: true,
  write: ['internal', 'public'],
  read: ['internal', 'public'],
  db: {
    type: 'json',
    field: 'image.credits',
    assign: true
  }
}, {
  field: 'title',
  languages: [],
  fieldType: 'text',
  optional: false,
  max: 150,
  write: ['internal', 'public'],
  read: ['internal', 'public'],
  db: {
    type: 'json'
  }
}, {
  field: 'description',
  languages: [],
  fieldType: 'text',
  optional: false,
  max: 200,
  write: ['internal', 'public'],
  read: ['internal', 'public'],
  db: {
    type: 'json'
  }
}, {
  field: 'longDescription',
  languages: [],
  fieldType: 'text',
  optional: true,
  max: 10000,
  write: ['internal', 'public'],
  read: ['internal', 'public'],
  db: {
    type: 'json'
  }
}, {
  field: 'keywords',
  fieldType: 'keywords',
  optional: true,
  list: true,
  default: [],
  languages: [],
  max: 255,
  write: ['internal', 'public'],
  read: ['internal', 'public'],
  db: {
    type: 'json'
  }
}, {
  field: 'conditions',
  languages: [],
  optional: true,
  write: ['internal', 'public'],
  read: ['internal', 'public'],
  max: 255,
  db: {
    type: 'json'
  },
  fieldType: 'text'
}, {
  field: 'age',
  fieldType: 'age',
  write: ['internal', 'public'],
  read: ['internal', 'public'],
  db: {
    type: 'json'
  }
}, {
  field: 'registration',
  fieldType: 'registration',
  write: ['internal', 'public'],
  read: ['internal', 'public'],
  max: 2000,
  db: {
    type: 'json'
  }
}, {
  field: 'accessibility',
  fieldType: 'accessibility',
  write: ['internal', 'public'],
  read: ['internal', 'public'],
  db: {
    type: 'json'
  },
  default: {
    mi: false,
    hi: false,
    pi: false,
    vi: false,
    ii: false
  }
}, {
  field: 'timings',
  fieldType: 'timings',
  optional: false,
  read: ['internal', 'public'],
  write: ['internal', 'public'],
  max: 800,
  db: {
    type: 'json'
  }
}, {
  field: 'status',
  fieldType: 'radio',
  default: 1,
  options: [{
    // event is scheduled to occur at provided timings
    id: 1,
    value: 'scheduled'
  }, {
    // event has been rescheduled, timings have been changed from what was previously published
    id: 2,
    value: 'rescheduled'
  }, {
    // event has been rescheduled and will occur entirely online
    id: 3,
    value: 'movedOnline'
  }, {
    // new timings are unknown...
    id: 4,
    value: 'postponed'
  }, {
    id: 5,
    value: 'full'
  }, {
    // event was cancelled
    id: 6,
    value: 'cancelled'
  }],
  write: ['internal', 'public'],
  read: ['internal', 'public']
}, {
  field: 'references',
  fieldType: 'references',
  optional: true,
  write: ['internal', 'public'],
  read: ['internal', 'public'],
  db: {
    type: 'json'
  }
}, {
  field: 'links',
  fieldType: 'enrichedLinks',
  optional: true,
  write: ['internal', 'public'],
  read: ['internal', 'public'],
  default: [],
  db: {
    type: 'json'
  }
}].map(f => {
  f.label = f.field;
  if (f.options) {
    f.options = f.options.map(o => ({ ...o, label: o.value }));
  }
  return f;
});
