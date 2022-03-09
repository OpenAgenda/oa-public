const geoFields = [{
  countryCode: null,
  fields: [{
    field: 'adminLevel1',
  }, {
    field: 'adminLevel2',
  }, {
    field: 'adminLevel3',
  }, {
    field: 'adminLevel4',
  }, {
    field: 'adminLevel5',
  }, {
    field: 'adminLevel6',
  }, {
    field: 'postalCode',
  }]
}, {
  countryCode: 'FR',
  fields: [{
    field: 'adminLevel1',
    label: 'adminLevel1_FR'
  }, {
    field: 'adminLevel2',
    label: 'adminLevel2_FR'
  }, {
    field: 'adminLevel3',
    label: 'adminLevel3_FR',
  }, {
    field: 'adminLevel4',
    label: 'adminLevel4_FR'
  }, {
    field: 'adminLevel5',
    label: 'adminLevel5_FR'
  }, {
    field: 'adminLevel6',
    label: 'adminLevel6_FR'
  }, {
    field: 'postalCode',
  }, {
    field: 'insee'
  }]
}, {
  countryCode: 'CH',
  fields: [{
    field: 'adminLevel1',
    label: 'adminLevel1_CH'
  }, {
    field: 'adminLevel4',
    label: 'adminLevel4_CH'
  }, {
    field: 'adminLevel5',
    label: 'adminLevel5_CH'
  }, {
    field: 'adminLevel6',
    label: 'adminLevel6_CH'
  }, {
    field: 'postalCode',
  }]
}].map(e => ({
  countryCode: e.countryCode,
  fields: e.fields.map(g => {
    if (g.label) return g;
    return { ...g, label: g.field };
  })
}));

module.exports = (country, field) => {
  if (!field) {
    return (geoFields.find(e => e.countryCode === country) || geoFields.find(e => e.countryCode === null));
  }
  return geoFields.find(e => e.countryCode === country).fields.find(e => e.field === field)?.label || geoFields.find(e => e.countryCode === null).fields.find(e => e.field === field).label;
};
