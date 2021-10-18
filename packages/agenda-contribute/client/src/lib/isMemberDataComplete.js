function isMemberDataComplete(data) {
  const fields = Object.keys(data ?? {});
  return fields.filter(field => !!data[field]).length === fields.length;
}

export default isMemberDataComplete;
