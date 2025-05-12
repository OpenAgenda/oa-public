import addText from './addText.js';

function addLink(prefix, doc, cursor, params) {
  return addText(doc, cursor, {
    ...params,
    content: params.value,
    link: `${prefix}${params.value}`,
  });
}

export default Object.assign(addLink.bind(null, ''), {
  phone: addLink.bind(null, 'tel:'),
  email: addLink.bind(null, 'mailto:'),
});
