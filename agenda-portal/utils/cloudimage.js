import qs from 'qs';

export default (cloudimageLink, event, query = {}) => {
  const { image } = event;

  if (!image) return null;

  let imageLink = image;
  if (typeof image === 'object') {
    // is v2 data format
    imageLink = image.base + image.filename;
  }

  return `${cloudimageLink}${imageLink}${qs.stringify(query, {
    addQueryPrefix: true,
  })}`;
};
