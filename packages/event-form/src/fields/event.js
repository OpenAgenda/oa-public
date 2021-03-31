'use strict';

module.exports = ({ labels, tiles, locationRes, fileStore }) => [{
  field: 'id',
  fieldType: 'integer',
  optional: false,
  read: ['internal'],
  write: ['internal']
}, {
  field: 'uid',
  fieldType: 'integer',
  optional: false,
  write: ['internal']
}, {
  field: 'slug',
  fieldType: 'text',
  optional: false,
  write: ['internal']
}, {
  field: 'private',
  fieldType: 'boolean',
  default: false,
  write: ['internal']
}, {
  field: 'timezone',
  fieldType: 'text',
  write: ['internal']
}, {
  field: 'draft',
  fieldType: 'boolean',
  default: false,
  write: ['internal']
}, {
  field: 'createdAt',
  fieldType: 'date',
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
  field: 'updatedAt',
  fieldType: 'date',
  write: ['internal']
}, {
  field: 'agendaUid',
  fieldType: 'integer',
  optional: false,
  write: ['internal']
}, {
  field: 'locationUid',
  fieldType: 'integer',
  optional: false,
  write: ['internal']
}, {
  field: 'image',
  fieldType: 'image',
  optional: true,
  label: labels.image,
  info: labels.imageInfo,
  allowURL: true,
  allowPath: true,
  extensions: ['jpg', 'bmp', 'png', 'jpeg'],
  store: fileStore
}, {
  field : 'imageCredits',
  fieldType : 'text',
  optional : true,
  label : labels.imageCredits,
  enableWith : 'image',
  max: 255
}, {
  field : 'languages',
  fieldType : 'languages',
  label : labels.languages
}, {
  languages: [],
  field: 'title',
  fieldType: 'text',
  optional: false,
  max: 140,
  label: labels.title,
  placeholder: labels.titlePlaceholder,
  purpose: labels.titlePurpose,
  sub: labels.titleSub
}, {
  languages: [],
  field: 'description',
  fieldType: 'text',
  optional: false,
  max: 200,
  label: labels.description,
  purpose: labels.descriptionPurpose,
  placeholder: labels.descriptionPlaceholder,
  sub: labels.descriptionSub
}, {
  languages: [],
  field: 'keywords',
  fieldType: 'keywords',
  optional: true,
  max: 255,
  label: labels.keywords,
  placeholder: labels.keywordsPlaceholder,
  sub: labels.keywordsSub
}, {
  languages: [],
  field : 'longDescription',
  fieldType : 'markdown',
  label: labels.longDescription,
  max: 10000,
  sub: labels.longDescriptionSub,
  placeholder: labels.longDescriptionPlaceholder
}, {
  languages: [],
  field : 'conditions',
  fieldType : 'text',
  label: labels.conditions,
  max: 255,
  placeholder: labels.conditionsPlaceholder,
  sub: labels.conditionsSub
}, {
  field: 'age',
  fieldType: 'age',
  optional: true,
  label: labels.age
}, {
  field: 'registration',
  fieldType: 'registration',
  optional: true,
  label: labels.registration,
  info: labels.registrationInfo,
  placeholder: labels.registrationPlaceholder,
  sub: labels.registrationSub
}, {
  field: 'accessibility',
  fieldType: 'accessibility',
  optional: true,
  label: labels.accessibility
}, {
  display: false,
  field: 'attendanceMode',
  fieldType: 'radio',
  label: labels.attendanceMode,
  optional: false,
  default: 1,
  options: [{
    id: 1,
    value: 'offline',
    label: labels.offlineAttendanceMode,
    info: labels.offlineAttendanceModeInfo
  }, {
    id: 2,
    value: 'online',
    label: labels.onlineAttendanceMode,
    info: labels.onlineAttendanceModeInfo
  }, {
    id: 3,
    value: 'mixed',
    label: labels.mixedAttendanceMode,
    info: labels.mixedAttendanceModeInfo
  }]
}, {
  field: 'location',
  fieldType: 'location',
  label: labels.location,
  sub: labels.locationSub,
  res: locationRes,
  optionalWith: {
    field: 'attendanceMode',
    value: 2
  },
  disableChange: false,
  tiles
}, {
  display: false,
  field: 'onlineAccessLink',
  fieldType: 'link',
  label: labels.onlineAccessLink,
  optional: false,
  enableWith: {
    field: 'attendanceMode',
    value: [2, 3]
  }
}, {
  field: 'timings',
  fieldType: 'timings',
  max: 800,
  optional: false,
  label: labels.timings,
  info: labels.timingsInfo,
  helpLink: 'https://openagenda.zendesk.com/hc/fr/articles/202667461-Saisir-les-horaires-de-votre-%C3%A9v%C3%A9nement'
}];