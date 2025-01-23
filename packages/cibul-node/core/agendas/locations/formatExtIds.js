const beforeInsert = (data) => {
  if (data?.extId || data.extId === null) {
    const { extId } = data;
    delete data.extId;
    return {
      ...data,
      extIds: [{ key: 'default', value: extId }],
    };
  }
  return data;
};

const afterRead = (inData) => {
  if (!inData) return;
  const data = { ...inData };
  data.extId = null;
  if (data.extIds && data.extIds.length) {
    const defaultExtId = data.extIds.find((extId) => extId.key === 'default');
    data.extId = defaultExtId ? defaultExtId.value : null;
  }
  return data;
};

const searchQuery = (query) => {
  if (!(query.locationExtId?.key && query.locationExtId?.value)) {
    return { key: 'default', value: query.locationExtId };
  }
  return query.locationExtId;
};

export default {
  afterRead,
  beforeInsert,
  searchQuery,
};
