import base64 from 'base64-js';

const utf8Encoder = new TextEncoder();
const utf8Decoder = new TextDecoder();

function encode(str: string): string {
  return base64.fromByteArray(utf8Encoder.encode(str));
}

function decode(str: string): string {
  return utf8Decoder.decode(base64.toByteArray(str));
}

const base64Utils: {
  encode: (str: string) => string;
  decode: (str: string) => string;
} = {
  encode,
  decode,
};

export default base64Utils;
