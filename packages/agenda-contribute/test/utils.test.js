import utils from '../src/lib/utils.js';
import filterEventDataFixtures from './fixtures/filterEventData.json' with { type: 'json' };
import filterEventDataFixturesWiths from './fixtures/filterEventDataWiths.json' with { type: 'json' };

const { filterEventData, schemaWithoutEventFields, removeUnduplicatable } = utils;

describe('utils', () => {
  describe('filterEventData', () => {
    test('if event fields are not displayed on app, they are filtered', () => {
      const { event, schema } = filterEventDataFixtures;

      const filteredEvent = filterEventData({
        event,
        canEditEvent: true,
        canChangeState: true,
        schema,
        displayEventFields: false,
      });

      expect(filteredEvent).toEqual({
        state: 2,
      });
    });

    test('event fields are not kept if edit event authorization is not given', () => {
      const { event, schema } = filterEventDataFixtures;

      const filteredEvent = filterEventData({
        event,
        canEditEvent: false,
        canChangeState: true,
        schema,
        displayEventFields: false,
      });

      expect(filteredEvent).toEqual({ state: 2 });
    });

    test('event field values are provided when linked to a field where authorization is provided', () => {
      const { event, schema } = filterEventDataFixturesWiths;

      const filteredEvent = filterEventData({
        event,
        canEditEvent: false,
        canChangeState: true,
        schema,
        displayEventFields: false,
      });

      expect(Object.keys(filteredEvent)).toEqual(['state', 'image']);
    });
  });
  describe('schemaWithoutEventFields', () => {
    test('event fields linked to extended fields are included but not enabled', () => {
      const filtered = schemaWithoutEventFields(
        filterEventDataFixturesWiths.schema,
      );

      expect(filtered.fields.find((f) => f.field === 'image').enable).toBe(
        false,
      );
    });
  });

  describe('removeUnduplicatable', () => {
    test('timings are removed from data to be used in duplication context', () => {
      const duplicatableData = removeUnduplicatable(
        {
          title: 'Destination agenda',
        },
        {
          title: 'Source Agenda',
          schema: { fields: [] },
        },
        {
          title: 'Event title',
          timings: [{ begin: 'begin', en: 'end' }],
        },
        'contributor',
      );

      expect(duplicatableData.timings).toBeUndefined();
    });

    test('registration items linked to specific ticketing services are filtered', () => {
      const duplicatableData = removeUnduplicatable(
        {
          title: 'Destination agenda',
        },
        {
          title: 'Source Agenda',
          schema: { fields: [] },
        },
        {
          title: 'Event title',
          registration: [
            {
              type: 'link',
              value: 'https://openagenda.com',
            },
            {
              type: 'link',
              value: 'https://pass.culture.fr',
              service: 'passCulture',
              data: {},
            },
          ],
        },
        'contributor',
      );

      expect(duplicatableData.registration).toEqual([
        {
          type: 'link',
          value: 'https://openagenda.com',
        },
      ]);
    });

    test('fields with display: false are removed', () => {
      const duplicatableData = removeUnduplicatable(
        {
          title: 'Destination agenda',
          uid: 'dest-uid',
        },
        {
          title: 'Source Agenda',
          uid: 'source-uid',
          schema: {
            fields: [
              {
                field: 'customField',
                display: false,
              },
            ],
          },
        },
        {
          title: 'Event title',
          customField: 'custom value',
          description: 'Event description',
        },
        'contributor',
      );

      expect(duplicatableData.customField).toBeUndefined();
      expect(duplicatableData.description).toBe('Event description');
    });

    test('fields with display array that excludes memberRole are removed', () => {
      const duplicatableData = removeUnduplicatable(
        {
          title: 'Destination agenda',
          uid: 'dest-uid',
        },
        {
          title: 'Source Agenda',
          uid: 'source-uid',
          schema: {
            fields: [
              {
                field: 'restrictedField',
                display: ['admin', 'editor'],
              },
            ],
          },
        },
        {
          title: 'Event title',
          restrictedField: 'restricted value',
          description: 'Event description',
        },
        'contributor',
      );

      expect(duplicatableData.restrictedField).toBeUndefined();
      expect(duplicatableData.description).toBe('Event description');
    });

    test('fields with display array that includes memberRole are kept', () => {
      const duplicatableData = removeUnduplicatable(
        {
          title: 'Destination agenda',
          uid: 'dest-uid',
        },
        {
          title: 'Source Agenda',
          uid: 'source-uid',
          schema: {
            fields: [
              {
                field: 'allowedField',
                display: ['admin', 'contributor', 'editor'],
              },
            ],
          },
        },
        {
          title: 'Event title',
          allowedField: 'allowed value',
          description: 'Event description',
        },
        'contributor',
      );

      expect(duplicatableData.allowedField).toBe('allowed value');
      expect(duplicatableData.description).toBe('Event description');
    });
  });
});
