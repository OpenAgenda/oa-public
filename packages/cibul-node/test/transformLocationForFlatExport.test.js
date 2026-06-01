import transformLocationForFlatExport from '../services/agendaLocations/lib/transformLocationForFlatExport.js';

// Pipe rows through the transform and collect the emitted objects.
const run = (options, locations) =>
  new Promise((resolve, reject) => {
    const transform = transformLocationForFlatExport(options);
    const rows = [];
    transform.on('data', (row) => rows.push(row));
    transform.on('error', reject);
    transform.on('end', () => resolve(rows));
    for (const location of locations) {
      transform.write(location);
    }
    transform.end();
  });

describe('transformLocationForFlatExport', () => {
  const includeFields = ['uid', 'name', 'city'];

  it('maps the requested flat fields and ignores tags when no group is defined', async () => {
    const [row] = await run({ lang: 'fr', includeFields, tagGroups: [] }, [
      { uid: 1, name: 'Lieu A', city: 'Paris', tags: [{ id: 9, label: 'x' }] },
    ]);

    // Headers are localized through the export labels.
    expect(row).toEqual({
      Identifiant: 1,
      Nom: 'Lieu A',
      Ville: 'Paris',
    });
    // No raw "tags" column leaks into the output.
    expect(Object.keys(row)).not.toContain('tags');
  });

  describe('with location tag groups (e.g. Ministry of Culture agendas)', () => {
    const tagGroups = [
      {
        name: 'Type de lieu',
        info: '',
        tags: [
          { id: 9, label: 'Édifice rural' },
          { id: 11, label: 'Espace naturel' },
        ],
      },
      {
        name: 'Label',
        info: '',
        tags: [{ id: 33, label: 'Première participation' }],
      },
    ];

    it('adds one column per group with the matching tag labels', async () => {
      const [row] = await run({ lang: 'fr', includeFields, tagGroups }, [
        {
          uid: 1,
          name: 'Lieu A',
          city: 'Paris',
          tags: [{ id: 9 }, { id: 11 }, { id: 33 }],
        },
      ]);

      expect(row['Type de lieu']).toBe('Édifice rural, Espace naturel');
      expect(row.Label).toBe('Première participation');
    });

    it('uses the localized tag-set label rather than the stored tag label', async () => {
      // The location store carries its own (possibly stale/multilingual) label,
      // but the catalog label for the request lang must win.
      const [row] = await run({ lang: 'fr', includeFields, tagGroups }, [
        {
          uid: 1,
          name: 'Lieu A',
          city: 'Paris',
          tags: [{ id: 9, label: 'Rural building' }],
        },
      ]);

      expect(row['Type de lieu']).toBe('Édifice rural');
    });

    it('falls back to the stored multilingual label for tags absent from the catalog group', async () => {
      // A tag whose id is not in any group is dropped entirely.
      const [row] = await run({ lang: 'fr', includeFields, tagGroups }, [
        {
          uid: 1,
          name: 'Lieu A',
          city: 'Paris',
          tags: [{ id: 999, label: { fr: 'Orphelin', en: 'Orphan' } }],
        },
      ]);

      expect(row['Type de lieu']).toBe('');
      expect(row.Label).toBe('');
    });

    it('emits every group column on every row so the column set stays consistent', async () => {
      const rows = await run({ lang: 'fr', includeFields, tagGroups }, [
        { uid: 1, name: 'Avec tags', city: 'Paris', tags: [{ id: 33 }] },
        { uid: 2, name: 'Tags vides', city: 'Lyon', tags: [] },
        { uid: 3, name: 'Sans clef tags', city: 'Lille' },
      ]);

      for (const row of rows) {
        expect(Object.keys(row)).toEqual([
          'Identifiant',
          'Nom',
          'Ville',
          'Type de lieu',
          'Label',
        ]);
      }
      expect(rows[0].Label).toBe('Première participation');
      expect(rows[1].Label).toBe('');
      expect(rows[2].Label).toBe('');
    });
  });
});
