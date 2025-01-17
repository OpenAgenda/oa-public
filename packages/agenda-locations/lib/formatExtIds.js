'use strict';

module.exports.afterRead = (data) => {
  const out = { ...data };
  if (data.extIds?.identifiers && !data.extIds?.identifiers.length) {
    out.extIds = null;
    return out;
  }
  if (data.extIds?.identifiers.length) {
    out.extIds = out.extIds.identifiers.map((id) => {
      const [key, value] = id.split('->');
      return { key, value };
    });
    return out;
  }
  return data;
};

module.exports.mergeExtIdsFn = (data, current) => {
  const currentExtIds = current.extIds;

  if (currentExtIds && data.extIds) {
    return data.extIds.reduce((acc, extId) => {
      const { key } = extId;
      const index = acc.findIndex((accElm) => {
        const { key: k } = accElm;
        return k === key;
      });

      if (index !== -1) {
        acc[index] = extId;
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
        if (value !== null) {
          acc.identifiers.push(`${key}->${value}`);
        }
        return acc;
      },
      { identifiers: [] },
    );
  }
  return out;
};
