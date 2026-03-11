import Service from '../service/index.js';
import { setupDatabase, getConfig } from './setup.js';

setupDatabase();

it('instanciate', () => {
  const service = new Service(getConfig());

  expect(service).toBeInstanceOf(Service);
});
