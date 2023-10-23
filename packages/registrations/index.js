import PassCulture from './passCulture/index.js';

export default function Registrations({
  passCulture: passCultureParams
}) {
  return settings => ({
    passCulture: PassCulture(passCultureParams, settings.passCulture),
  });
}