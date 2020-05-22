export default jQuery => {
  try {
    return JSON.parse(jQuery('#page-props').html());
  } catch (e) {
    console.log('failed to read page props', e);
  }

  return null;
};
