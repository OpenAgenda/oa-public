import qs from 'qs';

import eventSelectionFixtures from './fixtures/events.selection.json';

export default (req, res, ctx) => {
  const { search = '', uid = [] } = qs.parse(req.url.search.replace('?', ''));

  if (search?.length) {
    const matches = eventSelectionFixtures.events.filter(({ title }) => title.fr.indexOf(search) !== -1);

    // search is going on
    return res(ctx.json({
      total: matches.length,
      events: matches,
    }));
  }

  if (uid.length) {
    const matches = eventSelectionFixtures.events.filter(e => uid.includes(`${e.uid}`));

    // fetching a selection
    return res(ctx.json({
      total: matches.length,
      events: matches,
    }));
  }

  return res(ctx.json(eventSelectionFixtures));
};
