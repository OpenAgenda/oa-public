export default config => {
  if (config?.type !== 's3') {
    throw new Error(`unknown store type: ${config?.type}`);
  }

  return `//${config.bucket}.s3.amazonaws.com`;
};
