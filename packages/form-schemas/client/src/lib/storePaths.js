export default (config) => {
  if (config?.type !== 's3') {
    throw new Error(`unknown store type: ${config?.type}`);
  }

  return `https://cdn.openagenda.com/${config.bucket}`;
};
