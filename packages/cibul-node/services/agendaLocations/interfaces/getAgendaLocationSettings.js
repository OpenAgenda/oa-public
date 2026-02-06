import _ from 'lodash';

export default (services) => async (uid) => {
  const { core } = services;

  const schema = await core
    .agendas(uid)
    .settings.schema.getMerged({ access: 'internal' });

  if (!schema || !_.isArray(schema.fields)) {
    return null;
  }

  const locationField = _.first(
    schema.fields.filter((f) => (f.slug ?? f.field) === 'location'),
  );

  const legacy = _.get(locationField, 'legacy', null);

  const agenda = await core
    .agendas(uid)
    .get({ access: 'internal', private: null });

  if (!legacy) {
    return { locations: agenda.settings?.locations, locationField };
  }

  return { ...legacy, locations: agenda.settings?.locations, locationField };
};
