import base64 from 'base-64';
import utf8 from 'utf8';

export default function encodeURL(url) {
  const bytes = utf8.encode(url);
  return base64.encode(bytes);
}
