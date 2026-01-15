import _ from 'lodash';

function _getIdentifiers(namespaces, req) {
  const identifiers = {};

  _.forIn(namespaces, (v, k) => {
    if (!v) return;

    identifiers[k] = _.get(req, v);
  });

  return identifiers;
}

function Middleware(service) {
  return {
    load(options) {
      const params = _.merge(
        {
          instanciate: false,
          internal: false,
          private: false,
          includeImagePath: false,
          namespaces: {
            identifiers: {
              id: 'agendaId',
              uid: 'agendaUid',
              slug: 'agendaSlug',
            },
            result: 'agenda',
          },
        },
        options || {},
      );

      return async (req, res, next) => {
        try {
          const identifiers = _getIdentifiers(
            params.namespaces.identifiers,
            req,
          );

          const agenda = await service.get(
            identifiers,
            _.pick(params, [
              'instanciate',
              'internal',
              'private',
              'includeImagePath',
            ]),
          );

          _.set(req, params.namespaces.result, agenda);

          next();
        } catch (err) {
          next(err);
        }
      };
    },
  };
}

export default Middleware;
