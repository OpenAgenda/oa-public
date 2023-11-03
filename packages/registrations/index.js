import PassCulture from './passCulture/index.js';
import logs from '@openagenda/logs';

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