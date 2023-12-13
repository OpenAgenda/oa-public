import Registrations from '@openagenda/registrations';
import logs from '@openagenda/logs';

export function init(config) {
  const log = logs('services/registrations');
  if (!config.passCulture?.key) {
    log('warn', 'No passCultureKey provided, registrations is not initialized');
    return;
  }

  const svc = Registrations({
    passCulture: config.passCulture,
    log,
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
