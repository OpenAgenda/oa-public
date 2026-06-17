import { getLabel } from './utils.js';

export function getFieldAccess(field, lang) {
  const multilingual = {
    administrator: getLabel('adminAccess', lang),
    moderator: getLabel('moderatorAccess', lang),
    contributor: getLabel('contributorAccess', lang),
  };

  const writeFieldAccess = field?.write
    ?.map((access) => multilingual[access])
    .join(', ');
  const readFieldAccess = field?.read
    ?.map((access) => multilingual[access])
    .join(', ');

  if (field.write && !field.read) {
    return (
      <>
        {getLabel('writeAccess', lang)}: {writeFieldAccess}
      </>
    );
  }
  if (field.read && !field.write) {
    return (
      <>
        {getLabel('readAccess', lang)}: {readFieldAccess}
      </>
    );
  }
  if (field.write && field.read) {
    return (
      <>
        <span>
          {getLabel('readAccess', lang)}: {readFieldAccess}
        </span>
        <span> / </span>
        <span>
          {getLabel('writeAccess', lang)}: {writeFieldAccess}
        </span>
      </>
    );
  }
}
