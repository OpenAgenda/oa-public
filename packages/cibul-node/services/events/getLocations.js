const includeFields = [
  'uid',
  'setUid',
  'slug',
  'name',
  'address',
  'countryCode',
  'adminLevel1',
  'adminLevel2',
  'adminLevel3',
  'adminLevel4',
  'adminLevel5',
  'district',
  'postalCode',
  'insee',
  'latitude',
  'longitude',
  'region',
  'department',
  'city',
  'timezone',
  'updatedAt',
  'createdAt',
  'image',
  'description',
  'tags',
  'website',
  'email',
  'phone',
  'links',
  'access',
  'state',
  'imageCredits',
  'extId',
  'duplicateCandidates',
  'disqualifiedDuplicates',
  'mergedIn',
  'agendaUid',
  'extIds',
];

const getLocations = async (services, uids, options = {}) => {
  if (!uids) return [];

  const { formSchema } = options;

  // Normalize to array if single UID passed
  const uidsArray = Array.isArray(uids) ? uids : [uids];

  const result = await services.agendaLocations.list(
    { uids: uidsArray },
    { limit: uidsArray.length },
    {
      detailed: true,
      includeFields,
      deleted: null,
      formSchema, // Pass formSchema for tag filtering
    },
  );

  return result;
};

export default {
  promise: getLocations,
  callback: (services, uids, options, cb) =>
    getLocations(services, uids, options).then(cb.bind(null, null), cb),
};
