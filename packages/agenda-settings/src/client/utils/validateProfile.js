import agendaSchema from '@openagenda/agendas/service/validate/public';

export const schema = agendaSchema.struct;

export async function checkSlug(client, res, slug) {
  if (!slug) return;

  return client.post(res, { slug })
    .then(() => null)
    .catch(error => {
      if (error.response?.data?.errors) {
        return error.response.data.errors.find(v => v.field === 'slug')?.code;
      }
    });
}

export default function validate(values) {
  const errors = {};

  try {
    agendaSchema(values);
  } catch (e) {
    e.reduce((accu, next) => {
      accu[next.field] = next.code;
      return accu;
    }, errors);
  }

  if (values.description && values.description.split(/\r\n|\r|\n/).length > 4) {
    errors.description = 'description.tooManyLines';
  }

  return errors;
}
