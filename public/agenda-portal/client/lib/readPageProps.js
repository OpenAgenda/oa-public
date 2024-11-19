import debug from 'debug';

const log = debug('readPageProps');

export default (jQuery) => {
  try {
    return JSON.parse(jQuery('#page-props').html());
  } catch (e) {
    log('failed to read page props', e);
  }

  return null;
};
