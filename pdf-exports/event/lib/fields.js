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
