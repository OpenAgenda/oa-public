import ky from 'ky';

const APIBase = process.env.NEXT_STRAPI_API_BASE!;
const authToken = process.env.NEXT_STRAPI_API_AUTH_TOKEN!;

interface SchemaAttribute {
  type?: string;
  relation?: string;
  target?: string;
  component?: string;
  components?: string[];
  repeatable?: boolean;
}

interface SchemaAttributes {
  [key: string]: SchemaAttribute;
}

interface SchemaResponse {
  data: {
    schema: {
      attributes: SchemaAttributes;
    };
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
  }).json<SchemaResponse>();

  return res.data.schema.attributes;
};

const buildPopulateQuery = async (
  uid: string,
  type: 'content-type' | 'component' = 'content-type',
  prefix = '',
  depth = 0,
  maxDepth = 8,
  visited = new Set<string>(),
): Promise<Set<string>> => {
  const uniqueId = `${type}:${uid}:${prefix}`;
  if (depth > maxDepth || visited.has(uniqueId)) return new Set();

  visited.add(uniqueId);

  const schema = await fetchSchema(type, uid);
  const populate: Set<string> = new Set();

  for (const [key, attr] of Object.entries(schema)) {
    const currentPath = `${prefix}${key}`;
    if (attr.type === 'relation' && attr.target) {
      populate.add(currentPath);
      const nested = await buildPopulateQuery(
        attr.target.split('.')[1],
        'content-type',
        `${currentPath}.`,
        depth + 1,
        maxDepth,
        visited,
      );
      nested.forEach((el) => populate.add(el));
    } else if (attr.type === 'component' && attr.component) {
      populate.add(currentPath);
      const nested = await buildPopulateQuery(
        attr.component,
        'component',
        `${currentPath}.`,
        depth + 1,
        maxDepth,
        visited,
      );
      nested.forEach((el) => populate.add(el));
    } else if (attr.type === 'dynamiczone' && attr.components) {
      populate.add(currentPath);
      for (const componentUid of attr.components) {
        const nested = await buildPopulateQuery(
          componentUid,
          'component',
          `${currentPath}.`,
          depth + 1,
          maxDepth,
          visited,
        );
        nested.forEach((el) => populate.add(el));
      }
    }
  }

  return populate;
};

export default async function buildPopulateStrapiQuery(
  contentType: string,
  maxDepth = 8,
): Promise<string[]> {
  const populateSet = await buildPopulateQuery(
    contentType,
    'content-type',
    '',
    0,
    maxDepth,
  );
  return Array.from(populateSet);
}
