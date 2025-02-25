import _ from 'lodash';
import fixtures from '@openagenda/fixtures';
import svc from '../../index.js';

export default svc;

export async function initAndLoad(
  config,
  files = [
    'custom',
    'legacy_event',
    'agenda',
    'legacy_agenda_event',
    'legacy_agenda_event_tag',
    'legacy_agenda_tag',
    'legacy_category',
  ],
  options = {},
) {
  const params = _.extend(
    {
      reset: true,
    },
    options,
  );

  svc.init(config);

  fixtures.init({ mysql: config.mysql });

  return new Promise((rs, rj) => {
    fixtures(
      [
        {
          table: 'custom',
          src: `${import.meta.dirname}/../../custom.sql`,
        },
        {
          table: 'legacy_event',
          src: `${import.meta.dirname}/../fixtures/legacy_event.sql`,
        },
        {
          table: 'agenda',
          src: `${import.meta.dirname}/../fixtures/agenda.sql`,
        },
        {
          table: 'legacy_agenda_event',
          src: `${import.meta.dirname}/../fixtures/legacy_agenda_event.sql`,
        },
        {
          table: 'legacy_agenda_event_tag',
          src: `${import.meta.dirname}/../fixtures/legacy_agenda_event_tag.sql`,
        },
        {
          table: 'legacy_agenda_tag',
          src: `${import.meta.dirname}/../fixtures/legacy_agenda_tag.sql`,
        },
        {
          table: 'legacy_category',
          src: `${import.meta.dirname}/../fixtures/legacy_category.sql`,
        },
      ].filter((f) => files.includes(f.src.split('/').pop().split('.')[0])),
      params,
      (err) => {
        if (err) return rj(err);

        rs();
      },
    );
  });
}
