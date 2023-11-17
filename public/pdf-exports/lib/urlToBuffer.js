import axios from 'axios';

export default async function urlToBuffer(url) {
  const image = await axios.get(url, {
    responseType: 'arraybuffer',
  });
  const buffer = Buffer.from(image.data, 'base64');
  return buffer;
}
