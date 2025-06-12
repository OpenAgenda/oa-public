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

export const mainGroup = ({ imageField }) =>
  (imageField ? [imageField] : []).concat([
    {
      field: 'longDescription',
      fieldType: 'markdown',
    },
  ]);

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
    omitLabel: false,
    fieldType: 'text',
    displayLabelIfUnset: false,
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

export const locationCoordinates = (location) =>
  (['website', 'phone', 'email'].filter((f) => !!location[f]).length
    ? [
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
    ]
    : []
      .filter((f) => !!f)
      .map((f) => ({ ...f, fontSize: f.fontSize ?? '0.9em' })));

export const locationMain = ({ locationImage, title }) =>
  [
    title,
    {
      field: 'location.name',
      fieldType: 'text',
      bold: true,
    },
    {
      field: 'location.address',
      fieldType: 'text',
    },
    locationImage,
  ]
    .filter((f) => !!f)
    .map((f) => ({ ...f, fontSize: f.fontSize ?? '0.9em' }));

export const locationDescriptions = [
  {
    field: 'location.description',
    fieldType: 'text',
    filterUnset: true,
  },
  {
    field: 'location.access',
    fieldType: 'text',
    omitLabel: false,
    filterUnset: true,
  },
].map((f) => ({ ...f, fontSize: f.fontSize ?? '0.9em' }));
