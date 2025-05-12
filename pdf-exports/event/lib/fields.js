import sectionTitle from './sectionTitle.js';

export const headGroup = [
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
];

export const mainGroup = [
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

export const conditionsAndRegistrationGroup = [
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

export const timingsGroup = ({ lang }) => [
  sectionTitle('timingDetails', lang),
  {
    field: 'timings',
    fieldType: 'timings',
    relatedValues: ['timezone'],
  },
];

export const locationGroup = (location, { lang }) =>
  [
    sectionTitle('locationDetails', lang),
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
      displayLabelIfUnset: false,
    },
    ['website', 'phone', 'email'].filter((f) => !!location[f]).length && {
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
  ]
    .filter((f) => !!f)
    .map((f) => ({ ...f, fontSize: f.fontSize ?? '0.9em' }));
