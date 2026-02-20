import formatLegacyTags from '../../locations/formatLegacyTags.js';

const applyLegacyTagFilter = (location, formSchema) =>
  (formSchema && location?.tags
    ? formatLegacyTags(location, formSchema)
    : location);

async function extractLocationFromData(
  services,
  { completeEventData, data, verifyLocationExists = true, formSchema = null },
) {
  const { agendaLocations } = services;

  let locationUid = null;

  if (
    !data?.locationUid
    && !data?.location?.uid
    && (data?.locationUid === null
      || data?.location === null
      || data?.location?.uid === null)
  ) {
    return { location: null, locationUid };
  }

  if (data?.location?.uid || data.locationUid) {
    locationUid = data?.location?.uid ?? data.locationUid;
  } else {
    locationUid = completeEventData?.location?.uid ?? completeEventData?.locationUid;
  }

  if (
    !verifyLocationExists
    && locationUid // has a direct location uid ref
    && completeEventData?.location?.uid === locationUid // has a location object that is the same as the direct ref
  ) {
    const { location } = completeEventData;
    return {
      locationUid,
      location: applyLegacyTagFilter(location, formSchema),
    };
  }

  const location = locationUid
    ? await agendaLocations
      .get(
        {
          uid: locationUid,
        },
        {
          returnMergeTarget: true,
          deleted: null,
        },
      )
      .catch((e) => {
        if (e.name !== 'BadRequest') {
          throw e;
        }
      })
    : null;

  return { location: applyLegacyTagFilter(location, formSchema), locationUid };
}

export default extractLocationFromData;
