import statesMessages from '@openagenda/common-labels/event/states';

const stateIdToLabel = {
  '-1': 'refused',
  '0': 'toModerate',
  '1': 'readyToPublish',
  '2': 'published',
};

export default function getStateLabel(intl, state) {
  const message = statesMessages[stateIdToLabel[state]];
  if (!message) {
    console.log(`Missing message for state "${state}"`);
  }
  return intl.formatMessage(message).toLowerCase();
}
