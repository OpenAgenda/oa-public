import messages from './messages.js';

export default function getEventSortKeys(event, query, intl) {
  const params = new URLSearchParams(query);

  return params.getAll('sort[]').map((item) => {
    const key = item.replace(/\.(asc|desc)$/, '');
    const value = key.split('.').reduce((obj, prop) => obj?.[prop], event);

    return {
      key,
      value: value ?? intl.formatMessage(messages.undefined),
    };
  });
}
