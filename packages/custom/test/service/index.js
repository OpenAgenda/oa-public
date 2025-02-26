import _ from 'lodash';
import fixtures from '@openagenda/fixtures';
import svc from '../../index.js';

export default svc;

export async function initAndLoad(
  config,
  files = ['custom', 'agenda'],
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
          table: 'agenda',
          src: `${import.meta.dirname}/../fixtures/agenda.sql`,
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
