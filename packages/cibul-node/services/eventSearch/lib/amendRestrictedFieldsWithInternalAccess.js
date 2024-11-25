import { produce } from 'immer';

export default produce((draft) => ({
  ...draft,
  fields: draft.fields.map((field) => ({
    ...field,
    read:
      Array.isArray(field.read) && !field.read.includes('internal')
        ? field.read.concat('internal')
        : field.read,
  })),
}));
