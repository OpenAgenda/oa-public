import { produce } from 'immer';

function convertToDateHoursMinutesTimings({ utils }) {
  return event => produce(event, draft => {
    utils.convertDateHoursMinutesTimings.to(draft.timings, draft.timezone);
  });
}

export default convertToDateHoursMinutesTimings;
