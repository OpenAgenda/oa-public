export default function cleanDuplicateImage(core, image) {
  return {
    url: `${core.getConfig().s3.mainBucketPath}${image.variants.find((v) => v.type === 'full').filename}`,
  };
}

export function isImageToDuplicate(image) {
  if (!image) {
    return false;
  }

  if (image?.path) {
    return false;
  }

  return !!image?.filename;
}
