const extraGeoFields = [
  'adminLevel1',
  'adminLevel2',
  'adminLevel3',
  'adminLevel4',
  'adminLevel6',
  'postalCode',
];

export default countryCode => {
  if (countryCode.toUpperCase() === 'FR') return extraGeoFields.concat(['insee']);
  return extraGeoFields;
};
