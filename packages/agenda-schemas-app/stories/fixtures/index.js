import schema from './schema.json';
import memberSchema from './memberSchema.json';

export default function getFixtures(_agendaUid) {
  return { schema, memberSchema };
}
