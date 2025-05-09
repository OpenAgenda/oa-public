export const mainGroup = [
  {
    field: 'status',
    fieldType: 'select',
    hideIfIn: [1],
  },
  {
    field: 'title',
    fieldType: 'text',
    fontSize: '1.4em',
    bold: true,
  },
  {
    field: 'dateRange',
    fieldType: 'text',
  },
  'description',
  {
    field: 'image',
    fieldType: 'image',
    relatedValues: [{ from: 'imageCredits', to: 'credits' }],
  },
  {
    field: 'longDescription',
    fieldType: 'markdown',
  },
];

export const conditionsAndRegistrationGroup = ({ agenda, event }) => [
  {
    field: 'uid',
    fieldType: 'qr',
    value: `https//openagenda.com/agendas/${agenda.uid}/events/${event.uid}`,
    size: 80,
  },
  {
    field: 'attendanceMode',
    omitLabel: false,
    hideIfIn: [1],
  },
  {
    field: 'onlineAccessLink',
    omitLabel: false,
    displayLabelIfUnset: false,
  },
  {
    field: 'conditions',
    fieldType: 'text',
  },
  {
    field: 'registration',
    fieldType: 'registration',
  },
];

export const locationGroup = [
  {
    fieldType: 'text',
    value: 'À propos du lieu',
    bold: true,
    fontSize: '1.2em',
  },
  {
    field: 'location.name',
    fieldType: 'text',
    bold: true,
  },
  {
    field: 'location.address',
    fieldType: 'text',
  },
  {
    field: 'location.image',
    fieldType: 'image',
    relatedValues: [{ from: 'location.imageCredits', to: 'credits' }],
  },
  {
    field: 'location.description',
    fieldType: 'text',
  },
  {
    field: 'location.access',
    fieldType: 'text',
    omitLabel: false,
  },
  {
    fieldType: 'text',
    value: 'Coordonnées',
    bold: true,
  },
  {
    field: 'location.website',
    fieldType: 'link',
  },
  {
    field: 'location.phone',
    fieldType: 'phone',
  },
  {
    field: 'location.email',
    fieldType: 'email',
  },
].map((f) => ({ ...f, fontSize: f.fontSize ?? '0.9em' }));
