import Registrations from '@openagenda/registrations';
import logs from '@openagenda/logs';

const log = logs('services/registrations');

export function init(config) {
  if (!config.passCulture?.key) {
    log('warn', 'No passCultureKey provided, registrations is not initialized');
    return;
  }

  const svc = Registrations({
    passCulture: config.passCulture,
    logger: config.getLogConfig('svc', 'registrations'),
  });

  return Object.assign(svc, {
    settings: {
      passCulture: {
        offerLink: config.passCulture.offerLink,
        offerEditLink: config.passCulture.offerEditLink,
      },
    },
  });
}
