import transforms from './transforms.json' with { type: 'json' };

// easier to troubleshoot if separated
const _test = (rgx, value) => new RegExp(rgx).test(value);

export default (location) => {
  const updated = { ...location };
  // location is updated as it goes along transforms
  transforms.forEach((transform) => {
    if (
      !Object.keys(transform.matchAny).every((field) =>
        []
          .concat(transform.matchAny[field])
          .some((fieldValue) => _test(fieldValue, updated[field])))
    ) return;
    Object.assign(updated, transform.update);
  });
  return updated;
};
