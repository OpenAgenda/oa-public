import PassCulture from './passCulture/index.js';

export default function Registrations({
  passCulture: passCultureParams,
  log,
}) {
  return settings => ({
    passCulture: PassCulture({
      ...passCultureParams,
      log: log ?? { info: () => {}, error: () => {} },
    }, settings.passCulture),
  });
}
