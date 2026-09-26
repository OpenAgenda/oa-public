import logs from '@openagenda/logs';
import agenda from './agenda/index.js';

export default function WordExports(config = {}) {
  if (config.logger) {
    logs.setModuleConfig(config.logger);
  }

  return {
    agenda: agenda(config),
  };
}
