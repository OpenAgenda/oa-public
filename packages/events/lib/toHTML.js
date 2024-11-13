import { fromMarkdownToHTML } from '@openagenda/md';

export default (obj) => {
  if (typeof obj === 'object') {
    return Object.keys(obj).reduce(
      (html, lang) => ({
        ...html,
        [lang]: fromMarkdownToHTML(obj[lang]),
      }),
      {},
    );
  }
  return fromMarkdownToHTML(obj);
};
