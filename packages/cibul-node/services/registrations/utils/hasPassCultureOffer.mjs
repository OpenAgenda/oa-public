export default function hasPassCultureOffer({ registration }) {
  if (!registration) {
    return false;
  }

  return registration.find(({ service, data }) => service === 'passCulture' && data.id);
}
