import qs, { ParsedQs } from 'qs';

export default function parseLocationQuery(url: string): ParsedQs {
  const searchIndex = url.indexOf('?');

  if (searchIndex === -1) {
    return {};
  }

  return qs.parse(url.substring(searchIndex + 1));
}
