import { HttpResponse } from 'msw';
import qs from 'qs';
import eventSelectionFixtures from './fixtures/events.selection.json' with { type: 'json' };

export default ({ request }) => {
  const url = new URL(request.url);
  const { search = '', uid = [] } = qs.parse(url.search.replace('?', ''));

  if (search?.length) {
    const matches = eventSelectionFixtures.events.filter(
      ({ title }) => title.fr.indexOf(search) !== -1,
    );

    // search is going on
    return HttpResponse.json({
      total: matches.length,
      events: matches,
    });
  }

  if (uid.length) {
    const matches = eventSelectionFixtures.events.filter((e) =>
      uid.includes(`${e.uid}`));

    // fetching a selection
    return HttpResponse.json({
      total: matches.length,
      events: matches,
    });
  }

  return HttpResponse.json(eventSelectionFixtures);
};
