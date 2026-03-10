import { pipeline } from 'node:stream';
import { ICSStream } from '@openagenda/flat-exports';

export default (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/calendar',
  });

  const stream = new ICSStream({
    lang: req.lang,
    slug: req.agenda.slug,
    identifier: req.agenda.uid,
    title: req.agenda.title,
    description: req.agenda.description,
  });

  res.once('close', () => {
    if (!req.stream.destroyed) req.stream.destroy();
  });

  pipeline(req.stream, stream, res, () => {});
};
