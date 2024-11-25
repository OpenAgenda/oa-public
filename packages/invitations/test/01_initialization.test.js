import config from '../testconfig.js';
import * as service from './service/index.js';

describe('invitations - functional (server): initialization', () => {
  it('if the service is not initialized, endpoints will throw an error', () =>
    expect(
      service.assign(
        { email: 'test@gmail.com', token: 'fqfdsqfsdsq' },
        'adminCreate',
        {},
      ),
    ).rejects.toThrow('service not initialized'));

  it('initialize using .init()', () => {
    expect(() => service.init(config)).not.toThrow();
  });

  it('when testing use .initAndLoad to load fixtures at init', async () => {
    await expect(
      new Promise((resolve, reject) =>
        service.initAndLoad(config, (err) => {
          if (err) return reject(err);
          resolve();
        })),
    ).resolves.not.toThrow();
  });

  it('.initAndLoad can take the names of the fixture files to load', async () => {
    await expect(
      new Promise((resolve, reject) =>
        service.initAndLoad(config, ['invitation'], (err) => {
          if (err) return reject(err);
          resolve();
        })),
    ).resolves.not.toThrow();
  });
});
