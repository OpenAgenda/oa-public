'use strict';

module.exports.afterRead = (data) => {
  if (data.extIds?.identifiers.length) {
    const out = { ...data };
    out.extIds = out.extIds.identifiers.map((id) => {
      const [key, value] = id.split('->');
      return { key, value };
    });
    return out;
  }
  return data;
};

module.exports.protectExtIdsFn = (data, current) => {
  const currentExtIds = this.afterRead(current).extIds;

  if (currentExtIds && data.extIds) {
    return data.extIds.reduce((acc, extId) => {
      const { key } = extId;
      if (
        acc.find((e) => {
          const { key: k } = e;
          return k === key;
        })
      ) {
        return acc;
      }
      acc.push(extId);
      return acc;
    }, currentExtIds);
  }
  return data.extIds;
};

module.exports.beforeInsert = (data) => {
  const out = { ...data };
  if (out.extIds) {
    out.extIds = out.extIds.reduce(
      (acc, { key, value }) => {
        acc.identifiers.push(`${key}->${value}`);
        return acc;
      },
      { identifiers: [] },
    );
  }
  return out;
};
