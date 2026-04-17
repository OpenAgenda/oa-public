import ky from 'ky';

const APIBase = process.env.NEXT_STRAPI_API_BASE!;
const authToken = process.env.NEXT_STRAPI_API_AUTH_TOKEN!;

interface SchemaAttribute {
  type?: string;
  target?: string;
  component?: string;
  components?: string[];
}

interface SchemaAttributes {
  [key: string]: SchemaAttribute;
}

interface SchemaResponse {
  data: {
    schema: { attributes: SchemaAttributes };
  };
}

const fetchSchema = async (
  type: 'content-type' | 'component',
  uid: string,
): Promise<SchemaAttributes> => {
  const endpoint =
    type === 'content-type'
      ? `${APIBase}/content-type-builder/content-types/api::${uid}.${uid}`
      : `${APIBase}/content-type-builder/components/${uid}`;

  const res = await ky(endpoint, {
    headers: { Authorization: `Bearer ${authToken}` },
    next: { revalidate: 300 },
  }).json<SchemaResponse>();

  return res.data.schema.attributes;
};

const buildPopulateStrapiQuery = async (
  uid: string,
  type: 'content-type' | 'component' = 'content-type',
  prefix = '',
  depth = 0,
  maxDepth = 8,
  visited = new Set<string>(),
): Promise<string[]> => {
  const schemaKey = `${type}:${uid}:${prefix}`;
  if (depth > maxDepth || visited.has(schemaKey)) return [];

  visited.add(schemaKey);

  const schema = await fetchSchema(type, uid);
  const populate: Set<string> = new Set();

  for (const [key, attr] of Object.entries(schema)) {
    const currentPath = `${prefix}${key}`;

    switch (attr.type) {
      case 'relation':
        populate.add(currentPath);
        if (attr.target) {
          const nested = await buildPopulateStrapiQuery(
            attr.target.split('.')[1],
            'content-type',
            `${currentPath}.`,
            depth + 1,
            maxDepth,
            visited,
          );
          nested.forEach((item) => populate.add(item));
        }
        break;

      case 'component':
        populate.add(currentPath);
        if (attr.component) {
          const nested = await buildPopulateStrapiQuery(
            attr.component,
            'component',
            `${currentPath}.`,
            depth + 1,
            maxDepth,
            visited,
          );
          nested.forEach((item) => populate.add(item));
        }
        break;

      case 'dynamiczone':
        populate.add(currentPath);
        if (attr.components) {
          for (const componentUid of attr.components) {
            const nested = await buildPopulateStrapiQuery(
              componentUid,
              'component',
              `${currentPath}.`,
              depth + 1,
              maxDepth,
              visited,
            );
            nested.forEach((item) => populate.add(item));
          }
        }
        break;

      case 'media':
        populate.add(currentPath);
        break;

      default:
        break;
    }
  }

  return Array.from(populate);
};

export default buildPopulateStrapiQuery;
