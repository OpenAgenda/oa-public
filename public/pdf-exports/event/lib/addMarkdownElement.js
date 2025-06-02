import logs from '@openagenda/logs';
import addDefaultElement from './addDefaultElement.js';
import addParentElement from './addParentElement.js';

const log = logs('addMarkdownElement');

const lgi = (depth) => '  '.repeat(depth);

export default async function addMarkdownElement(doc, state, element, params) {
  const { depth } = params;
  log(`${lgi(depth)}addMarkdownElement of type %s`, element.type);

  if (element.children) {
    return addParentElement(
      doc,
      state,
      element,
      { ...params, url: element.url },
      addMarkdownElement,
    );
  }

  if (['text', 'link'].includes(element.type)) {
    return addDefaultElement(doc, state, element, params);
  }

  if (element.type === 'image') {
    return addDefaultElement(doc, state, { ...element, type: 'link' }, params);
  }

  return { width: 0, height: 0 };
}
