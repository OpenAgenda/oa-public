import VError from '@openagenda/verror';

export default async (services, schemaIds = []) => {
  const { formSchemas } = services;

  const schemas = [];

  for (const schemaId of schemaIds) {
    if (!schemaId) {
      schemas.push(null);
      continue;
    }

    const schema = await formSchemas.get(schemaId);

    if (!schema) {
      throw new VError('Schema of id %s was not found', schemaId);
    }

    schemas.push(schema);
  }

  return schemas;
};
