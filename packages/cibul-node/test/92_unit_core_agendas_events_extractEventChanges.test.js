import extractEventChanges from '../core/agendas/events/lib/extractEventChanges.js';
import loadObjectFromFile from './fixtures/loadObjectFromFile.js';

const load = loadObjectFromFile({ cwd: import.meta.dirname });

const changedEvent = load('fixtures/events/changed.json');

describe('extractEventChanges', () => {
  it('should indicate no change when there are no changes', () => {
    const { hasChanges, changedFields } = extractEventChanges({
      before: changedEvent.before,
      after: changedEvent.after,
      formSchema: changedEvent.formSchema,
      agenda: changedEvent.agenda,
    });

    expect(hasChanges).toBe(false);
    expect(changedFields).toEqual({});
  });

  it('should indicate changes when there are changes', () => {
    const { hasChanges, changedFields } = extractEventChanges({
      before: changedEvent.before,
      after: {
        ...changedEvent.after,
        'capacite-daccueil-nombre-de-lits-pour-les-adultes-assurant-lencadrement': 4,
      },
      formSchema: changedEvent.formSchema,
      agenda: changedEvent.agenda,
    });

    expect(hasChanges).toBe(true);
    expect(changedFields).toEqual({
      contributor: [
        {
          label: {
            fr: 'Nombre de lits pour les adultes assurant l’encadrement',
          },
        },
      ],
    });
  });
});
