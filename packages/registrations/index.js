import PassCulture from './passCulture/index.js';

export default function Registrations({
  passCulture: passCultureParams
}) {
  return {
    passCulture: PassCulture(passCultureParams),
  };
}