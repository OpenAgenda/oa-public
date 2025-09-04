import base64 from 'base64-js';

const utf8Encoder = new TextEncoder();
const utf8Decoder = new TextDecoder();

export function encode(str: string): string {
  return base64.fromByteArray(utf8Encoder.encode(str));
}

export function decode(str: string): string {
  return utf8Decoder.decode(base64.toByteArray(str));
}

const exports = {
  encode,
  decode,
};

export default exports;
