const beforeInsert = (data) => {
  if (data?.extId || data.extId === null) {
    return { ...data, extIds: [{ key: 'default', value: data.extId }] };
  }
  return data;
};

const afterRead = (data) => {
  /* data.extId = null; */
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
