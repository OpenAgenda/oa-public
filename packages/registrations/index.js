import PassCulture from "./passCulture";

export default function Registrations({
  PassCultureKey
}) {
  return {
    passCulture: PassCulture({ key: PassCultureKey }),
  };
}