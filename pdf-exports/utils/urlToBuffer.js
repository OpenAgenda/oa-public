import axios from 'axios';

export default async function urlToBuffer(url, replacementImage) {
  try {
    const image = await axios.get(url.replace('dev', 'main'), {
      responseType: 'arraybuffer',
    });
    const buffer = Buffer.from(image.data, 'base64');
    return buffer;
  } catch (error) {
    console.error('Error fetching image:', error);

    return replacementImage;
  }
}
