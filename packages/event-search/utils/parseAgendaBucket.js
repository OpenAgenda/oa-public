import { inflate } from './aggregatorObjects.js';

export default (bucket) => {
  const agenda = inflate(bucket.key);

  const key = agenda.uid;
  agenda.uid = parseInt(agenda.uid, 10);

  return {
    key,
    agenda,
    eventCount: bucket.doc_count,
  };
};
