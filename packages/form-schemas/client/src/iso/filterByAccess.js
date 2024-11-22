import { produce } from 'immer';

export default function filterByAccess(formSchema, access) {
  if (!formSchema) {
    return formSchema;
  }

  return produce(formSchema, (draft) => {
    draft.fields = draft.fields.filter(
      (f) => !(f.read ?? []).length || f.read.includes(access),
    );
  });
}
