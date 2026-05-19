import { base64Url } from '@better-auth/utils/base64';
import { binary } from '@better-auth/utils/binary';

// Unverified base64Url decode of better-auth's session_data cookie value
// (compact strategy). Use when an HMAC verify is impractical — e.g. an OTel
// `spanStart` listener that must run synchronously. The decoded payload is
// only safe to consume as observability data, never as an authorization
// signal.
export function decodeSessionDataUnsafe(cookieValue) {
  if (!cookieValue || typeof cookieValue !== 'string') return null;
  try {
    return JSON.parse(binary.decode(base64Url.decode(cookieValue)));
  } catch {
    return null;
  }
}
