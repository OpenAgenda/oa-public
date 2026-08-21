import ky from 'ky';

// A render always reads from the production bucket: a dev run has no objects of
// its own to show, so the bucket segment is swapped on the way out.
//
// Anchored on that segment — `/dev/`, between the host and the key — and NOT on
// a bare `dev`. `String.replace` with a string pattern hits the first match
// anywhere in the URL, so the unanchored form corrupted any object whose name
// happens to contain those three letters, in production, where there is no
// bucket segment to find and the filename is the only match left:
// `/main/agenda-developpement.jpg` came back as
// `/main/agenda-maineloppement.jpg`, and the image 404'd into the fallback.
const fromProductionBucket = (url) => url.replace('/dev/', '/main/');

export default async function urlToBuffer(url, replacementImage) {
  try {
    const image = await ky.get(fromProductionBucket(url)).arrayBuffer();
    return Buffer.from(image);
  } catch (error) {
    return replacementImage;
  }
}
