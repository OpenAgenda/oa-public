import VError from 'verror';

export default function parseJsonResponse(res) {
  try {
    res.body = JSON.parse(res.text);
  } catch (err) {
    throw new VError('Error on parsing json response', err);
  }

  return res;
}
