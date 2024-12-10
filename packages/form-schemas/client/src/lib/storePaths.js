export default (config) => {
  if (config?.type !== 's3') {
    throw new Error(`unknown store type: ${config?.type}`);
  }

  return `https://02034510ef5d488190e4cf17d19a788b.s3.pub1.infomaniak.cloud/${config.bucket}`;
};
