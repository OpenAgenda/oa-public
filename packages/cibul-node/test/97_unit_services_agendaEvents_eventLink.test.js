import eventLink from '../services/agendaEvents/lib/utils/eventLink.js';

describe('agendaEvents eventLink helper', () => {
  it('builds canonical url with uid_slug suffix', () => {
    const url = eventLink(
      'https://openagenda.com',
      { slug: 'agenda-de-test' },
      { slug: 'concert-jazz', uid: 12345678 },
    );
    expect(url).toBe(
      'https://openagenda.com/agenda-de-test/events/12345678_concert-jazz',
    );
  });

  it('keeps legacy slugs ending in _<digits> intact in the slug portion', () => {
    const url = eventLink(
      'https://openagenda.com',
      { slug: 'agenda-de-test' },
      { slug: 'summer-fest_2024', uid: 987654 },
    );
    expect(url).toBe(
      'https://openagenda.com/agenda-de-test/events/987654_summer-fest_2024',
    );
  });
});
