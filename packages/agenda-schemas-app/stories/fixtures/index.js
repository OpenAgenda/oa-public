import schema from './schema.json' with { type: 'json' };
import memberSchema from './memberSchema.json' with { type: 'json' };

export default function getFixtures(_agendaUid) {
  return { schema, memberSchema };
}
