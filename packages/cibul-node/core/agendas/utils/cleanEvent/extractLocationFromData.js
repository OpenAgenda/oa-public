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
      location, // Already formatted by agenda-locations
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
          formSchema, // Pass formSchema for tag filtering
        },
      )
      .catch((e) => {
        if (e.name !== 'BadRequest') {
          throw e;
        }
      })
    : null;

  return { location, locationUid }; // Already formatted by agenda-locations
}

export default extractLocationFromData;
