'use strict';

const formatAgendaHead = require('../lib/utils/formatAgendaHead');
const agendaSettings = require('./fixtures/agendaSettings.json');
const agendaLegacySettings = require('./fixtures/agendaLegacySettings.json');

describe('20 - lib/utils - formatAgendaHead', () => {
  test('map of slugs to schema ids is added', () => {
    const formatted = formatAgendaHead(
      123,
      agendaSettings,
      agendaLegacySettings
    );

    expect(formatted.slugSchemaOptionIdMap[1]).toEqual({
      fieldName: 'type-devenement',
      optionId: 34,
      schemaId: 9661,
      slug: 'animation'
    });
  });
});
