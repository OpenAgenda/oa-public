import logger from '@openagenda/logs';
import integer from '@openagenda/validators/integer';

const log = logger('disqualifyCandidates');

const validate = integer({
  list: { min: 2 },
});

async function disqualifyCandidate(endpoints, dirtyUids) {
  log('dirtyUids', dirtyUids);
  const locationUids = validate(dirtyUids);
  const locations = await endpoints.list(
    { uids: locationUids },
    {},
    { detailed: true },
  );

  const loadedLocationUids = locations.map((l) => l.uid);
  log('listed locations', loadedLocationUids);
  for (const location of locations) {
    const toMove = location.duplicateCandidates?.filter((c) =>
      loadedLocationUids.includes(c)) || [];
    const newDuplicateCandidates = location.duplicateCandidates?.filter((c) => !toMove.includes(c)) || [];
    const newDisqualifiedDuplicates = (
      location.disqualifiedDuplicates || []
    ).concat(toMove);
    try {
      await endpoints.patch(location.uid, {
        duplicateCandidates: newDuplicateCandidates.length
          ? newDuplicateCandidates
          : null,
        disqualifiedDuplicates: newDisqualifiedDuplicates.length
          ? newDisqualifiedDuplicates
          : null,
      });
    } catch (error) {
      log.error('while pactching', error);
    }
  }
  log('info', 'processed', { uids: locationUids, count: locationUids.length });
  log('disqualify went well');
}

export default disqualifyCandidate;
