import isURL from 'validator/lib/isURL.js';
import validators from '@openagenda/validators';

const validatePage = validators.integer({
  min: 1,
  default: 1,
});
const isNumberLike = (value) =>
  !Number.isNaN(Number(value)) && Number.isFinite(parseInt(value, 10));
const limit = 20;

export default async function searchAgendas(req, res, next) {
  const { agendas: agendasSvc } = req.app.services;
  const query = {};

  async function listAgendas(q) {
    return agendasSvc.list(
      q,
      (validatePage(req.query.searchPage) - 1) * limit,
      limit,
      { total: true, private: null },
    );
  }

  try {
    if (req.query.oas?.search && isURL(req.query.oas.search)) {
      const uidOrSlug = req.query.oas.search
        .split('/')
        .pop()
        .split('?')
        .shift();
      const isUID = isNumberLike(uidOrSlug);

      res.json(
        await listAgendas({
          [isUID ? 'uid' : 'slug']: isUID ? parseInt(uidOrSlug, 10) : uidOrSlug,
        }),
      );
    } else if (isNumberLike(req.query.oas?.search, 10)) {
      query.uid = parseInt(req.query.oas.search, 10);
      const { agendas, total } = await listAgendas({
        uid: parseInt(req.query.oas.search, 10),
      });

      if (total !== 0) {
        return res.json({ agendas, total });
      }

      // try to search text
      res.json(await listAgendas({ search: req.query.oas.search }));
    } else if (req.query.oas?.search?.length) {
      res.json(await listAgendas({ search: req.query.oas.search }));
    } else {
      res.json(await listAgendas({}));
    }
  } catch (e) {
    next(e);
  }
}
