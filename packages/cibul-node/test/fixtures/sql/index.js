import fs from 'node:fs';
import Knex from 'knex';

export const knex = Knex({
  client: 'mysql',
});

export const resetAndCreateTables = () =>
  [
    'reset.sql',
    'agenda.create.sql',
    'network.create.sql',
    'user.create.sql',
    'formSchema.create.sql',
    'member.create.sql',
    'event.create.sql',
    'custom.create.sql',
    'agendaEvent.create.sql',
    'location.create.sql',
    'locationSet.create.sql',
    'aggregator.create.sql',
    'aggregatorSource.create.sql',
    'legacyEvent.create.sql',
    'legacyEventEditor.create.sql',
    'legacyEventLocation.create.sql',
    'legacyEventTranslation.create.sql',
    'legacyEventLocationTranslation.create.sql',
    'legacyOccurrence.create.sql',
    'legacyDeleted.create.sql',
    'legacyAgendaEvent.create.sql',
    'legacyAgendaEventTag.create.sql',
    'legacyAgendaCategory.create.sql',
    'legacyEventReference.create.sql',
    'legacyCategorySet.create.sql',
    'legacyAgendaTag.create.sql',
    'legacyTagSet.create.sql',
    'apiKeySet.create.sql',
    'key.create.sql',
    'accessToken.create.sql',
    'activity.create.sql',
    'activityFeed.create.sql',
    'activityFeedActivity.create.sql',
    'usageCounter.create.sql',
  ].map(fx => fs.readFileSync(`${import.meta.dirname}/${fx}`, 'utf-8').replace(/;(\n|)$/, ''));
