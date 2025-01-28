const replaceCDNWithStorage = (base) => {
  if (!base) {
    return base;
  }
  return base.replace(/\/\/cdn\./, '//storage.');
};

export default (img) => {
  if (!img || img?.filename === null) {
    return {
      image: false,
      thumbnail: false,
      originalImage: false,
    };
  }

  if (!img?.variants || !img.variants.length) {
    return {
      image: replaceCDNWithStorage(img.base) + img.filename,
      thumbnail: false,
      originalImage: false,
    };
  }

  const { base, filename, variants } = img;

  const image = replaceCDNWithStorage(base) + filename;
  const thumbnail = replaceCDNWithStorage(base)
    + variants.find((variant) => variant.type === 'thumbnail').filename;
  const originalImage = replaceCDNWithStorage(base)
    + variants.find((variant) => variant.type === 'full').filename;

  return {
    image,
    thumbnail,
    originalImage,
  };
};
