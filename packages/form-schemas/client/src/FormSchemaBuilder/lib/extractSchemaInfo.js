import _ from 'lodash';

export default (field, extensions = []) => {
  const matchingExtensionIndex = _.findIndex(extensions.map(e => e.schema), e => e.id === field.schemaId);

  if (matchingExtensionIndex === -1) return null;

  return extensions[matchingExtensionIndex].info;
};
