import stateMessages from '../../utils/stateMessages.js';

export default (intl) => [
  {
    value: 0,
    label: intl.formatMessage(stateMessages.stateToControl),
  },
  {
    value: 1,
    label: intl.formatMessage(stateMessages.stateControlled),
  },
  {
    value: 2,
    label: intl.formatMessage(stateMessages.statePublished),
  },
];
