import { promisify } from 'node:util';

export default (services, agendaId) =>
  promisify(services.elasticsearch.agendas({ id: agendaId }).resync)();
