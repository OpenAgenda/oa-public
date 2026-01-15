import Files from '@openagenda/files';
import Agendas from '../service/index.js';
import testConfig from '../testconfig.js';

const { service: config, dependencies: dConfig } = testConfig;

const svc = Agendas({
  ...config,
  Files: Files(dConfig.files),
});

const { utils } = svc;

describe('agendas - utils', () => {
  describe('filterByAccess', () => {
    it('if access is unspecified or public, public fields are provided', () => {
      const filtered = utils.filterByAccess({
        title: 'Un agenda',
      });

      expect(filtered).toEqual({
        title: 'Un agenda',
      });
    });

    it('if access is given unlisted value defaults to public', () => {
      const filtered = utils.filterByAccess(
        {
          title: 'Un agenda',
        },
        'read',
        'hobgoblin',
      );

      expect(filtered).toEqual({
        title: 'Un agenda',
      });
    });

    it('a field with internal read access is filtered out if requested access is public', () => {
      const filtered = utils.filterByAccess({
        id: 218,
        title: 'Un agenda',
      });

      expect(filtered).toEqual({
        title: 'Un agenda',
      });
    });

    it('a field with internal read access is only provided if internal is requested', () => {
      const filtered = utils.filterByAccess(
        {
          id: 218,
          title: 'Un agenda',
        },
        'read',
        'internal',
      );

      expect(filtered).toEqual({
        id: 218,
        title: 'Un agenda',
      });
    });

    it('contribution types can be read accessed by an administrator', () => {
      const filtered = utils.filterByAccess(
        {
          settings: {
            contribution: {
              type: 1,
            },
          },
        },
        'read',
        'administrator',
      );

      expect(filtered.settings.contribution.type).toBe(1);
    });
  });
});
