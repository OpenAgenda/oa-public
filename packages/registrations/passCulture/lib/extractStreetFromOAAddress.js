const trimTrail = (s) => s.replace(/,(\s|)$/, '').trim();

export default function extractStreetFromOAAddress({ address, postalCode }) {
  if (address.split(postalCode).length === 2) {
    // postalCode was found as provided
    return trimTrail(address.split(postalCode)[0]);
  }

  const typicalPostalCodeRegex = /[0-9][0-9][0-9][0-9][0-9]/;
  if (address.split(typicalPostalCodeRegex).length === 2) {
    return trimTrail(address.split(typicalPostalCodeRegex)[0]);
  }

  return address;
}
