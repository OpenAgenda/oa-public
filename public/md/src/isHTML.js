import HTMLTags from 'html-tags';

const basic = /\s?<!doctype html>|(<html\b[^>]*>|<body\b[^>]*>|<x-[^>]+>)+/i;
const full = new RegExp(
  HTMLTags.map((tag) => `<${tag}\\b[^>]*>`).join('|'),
  'i',
);

export default function isHTML(str, options = {}) {
  const { length: evaluatedMaxLength = 5000 } = options;

  const slicedStr = str.trim().slice(0, evaluatedMaxLength);

  return basic.test(slicedStr) || full.test(slicedStr);
}
