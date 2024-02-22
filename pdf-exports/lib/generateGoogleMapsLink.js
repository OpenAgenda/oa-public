import querystring from 'node:querystring';

export default function generateGoogleMapsLink(address) {
  const formattedAddress = querystring.escape(address);
  const googleMapsLink = `https://www.google.com/maps?q=${formattedAddress}`;
  return googleMapsLink;
}
