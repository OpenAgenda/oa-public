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

const afterRead = (data) => {
  if (Object.keys(data).includes('extIds')) {
    data.extId = null;
  }
  if (data.extIds && data.extIds.length) {
    const defaultExtId = data.extIds.find((extId) => extId.key === 'default');
    data.extId = defaultExtId ? defaultExtId.value : null;
  }
  return data;
};

export default {
  afterRead,
  beforeInsert,
};
