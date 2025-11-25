import _ from 'lodash';

function get(options = {}) {
  const defaultValue = options?.load?.default;
  return {
    event: defaultValue ?? true,
    custom: defaultValue ?? true,
    agendaEvent: defaultValue ?? true,
    user: defaultValue ?? true,
    agenda: defaultValue ?? true,
    member: defaultValue ?? true,
    valid: defaultValue ?? false,
    ..._.omit(options.load, ['default']),
  };
}

function getValid(options) {
  const loadOptions = get(options);

  if (!loadOptions.valid) {
    return false;
  }

  for (const loadKey of ['event', 'custom', 'agendaEvent']) {
    if (!loadOptions[loadKey]) {
      throw new Error('All data must be loaded to evaluate event validity');
    }
  }

  return true;
}

export default {
  getValid,
  get,
};
