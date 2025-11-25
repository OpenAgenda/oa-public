import ky from 'ky';

export default async function urlToBuffer(url, replacementImage) {
  try {
    const image = await ky.get(url.replace('dev', 'main')).arrayBuffer();
    return Buffer.from(image);
  } catch (error) {
    console.error('Error fetching image:', error);

    return replacementImage;
  }
}
