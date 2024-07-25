import _ from 'lodash';

const fallbackGetters = {
  thumbnail: 'getThumbnail',
  full: 'getFullImage',
};

/**
 * events service data structure is different.
 * if event was created first by events service, image data is also saved in legacy event store.
 */

export default (config, eventInstance, imageType) => {
  const fallbackGetter = eventInstance[fallbackGetters[imageType]];

  try {
    const images = _.get(_.isObject(eventInstance.store) ? eventInstance.store : JSON.parse(eventInstance.store), 'images');

    const match = _.first(_.get(images, 'variants').filter(v => v.type === imageType));

    if (!match) return fallbackGetter();

    return config.aws.imageBucketPath + match.filename;
  } catch (e) {
    //
  }

  return fallbackGetter();
};
