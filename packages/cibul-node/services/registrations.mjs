import Registrations from '@openagenda/registrations';
import logs from '@openagenda/logs';

const log = logs('services/registrations');

export function init(config) {
  if (!config.passCulture?.key) {
    log('warn', 'No passCultureKey provided, registrations is not initialized');
    return;
  }
  return Registrations({
    passCulture: config.passCulture,
  });
}
