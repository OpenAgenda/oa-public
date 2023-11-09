import logs from '@openagenda/logs';
import PassCulture from './passCulture/index';

export default function Registrations({
  passCulture: passCultureParams,
  logger,
}) {
  if (logger) {
    logs.setModuleConfig(logger);
  }
  return settings => ({
    passCulture: PassCulture(passCultureParams, settings.passCulture),
  });
}
