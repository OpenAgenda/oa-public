import { BadRequest } from '@openagenda/verror';
import { getRelatedFieldName, getRelatedFieldOptions } from '../utils.js';

export default function validateRelatedField({ categories, related }, data) {
  const relatedFieldName = getRelatedFieldName(categories, data.category);

  if (!relatedFieldName) {
    return { name: undefined, value: undefined };
  }

  if (relatedFieldName && !data[relatedFieldName]) {
    throw new BadRequest({
      info: {
        errors: [
          {
            message: `${relatedFieldName} is required`,
            code: `registration.pass.${relatedFieldName}.required`,
            label: 'Une sous-catégorie doit être définie',
            field: relatedFieldName,
          },
        ],
      },
    });
  }

  const matchingOption = getRelatedFieldOptions(related, relatedFieldName).find(
    ({ value }) => value === data[relatedFieldName],
  );

  if (!matchingOption) {
    throw new BadRequest({
      info: {
        errors: [
          {
            message: `${relatedFieldName} is invalid`,
            code: `registration.pass.${relatedFieldName}.invalid`,
            label: 'Une sous-catégorie valide doit être définie',
            field: relatedFieldName,
          },
        ],
      },
    });
  }

  return {
    name: relatedFieldName,
    value: matchingOption.value,
  };
}
