import addText from './addText.js';

export default function addLink(doc, cursor, params) {
  return addText(doc, cursor, {
    ...params,
    content: params.value,
    link: params.value,
  });
}
