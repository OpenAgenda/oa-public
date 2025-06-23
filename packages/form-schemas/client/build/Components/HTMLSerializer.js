import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import _trimInstanceProperty from "@babel/runtime-corejs3/core-js/instance/trim";
import "core-js/modules/es.array.iterator.js";
import "core-js/modules/es.regexp.exec.js";
import "core-js/modules/es.string.replace.js";
import "core-js/modules/web.dom-collections.iterator.js";
const MARK_TAGS = {
  strong: 'bold',
  em: 'italic',
  u: 'underline',
  s: 'strikethrough',
  code: 'code'
};
const BLOCK_TAGS = {
  p: 'paragraph',
  li: 'list-item',
  ul: 'bulleted-list',
  ol: 'numbered-list',
  blockquote: 'quote',
  pre: 'code-block',
  h1: 'heading-one',
  h2: 'heading-two',
  h3: 'heading-three',
  h4: 'heading-four',
  h5: 'heading-five',
  h6: 'heading-six'
};
function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function applyMarkToDescendants(node, markType) {
  if (node.text !== undefined) {
    return _objectSpread(_objectSpread({}, node), {}, {
      [markType]: true
    });
  }
  if (node.children && Array.isArray(node.children)) {
    return _objectSpread(_objectSpread({}, node), {}, {
      children: node.children.map(child => applyMarkToDescendants(child, markType))
    });
  }
  return node;
}
function serializeNode(node) {
  if (node.text !== undefined) {
    let text = escapeHtml(node.text);
    if (node.bold) {
      text = "<strong>".concat(text, "</strong>");
    }
    if (node.italic) {
      text = "<em>".concat(text, "</em>");
    }
    if (node.underline) {
      text = "<u>".concat(text, "</u>");
    }
    return text;
  }
  const childrenHtml = (node.children || []).map(serializeNode).join('');
  switch (node.type) {
    case 'paragraph':
      return "<p>".concat(childrenHtml, "</p>");
    case 'heading-one':
      return "<h1>".concat(childrenHtml, "</h1>");
    case 'heading-two':
      return "<h2>".concat(childrenHtml, "</h2>");
    case 'heading-three':
      return "<h3>".concat(childrenHtml, "</h3>");
    case 'bulleted-list':
      return "<ul>".concat(childrenHtml, "</ul>");
    case 'numbered-list':
      return "<ol>".concat(childrenHtml, "</ol>");
    case 'list-item':
      return "<li>".concat(childrenHtml, "</li>");
    case 'quote':
      return "<blockquote>".concat(childrenHtml, "</blockquote>");
    case 'code-block':
      return "<pre><code>".concat(childrenHtml, "</code></pre>");
    case 'link':
      {
        const url = node.url || '#';
        return "<a href=\"".concat(escapeHtml(url), "\">").concat(childrenHtml, "</a>");
      }
    default:
      return childrenHtml;
  }
}
function deserializeElements(domNodes) {
  const array = [];
  domNodes.forEach(domNode => {
    // TEXT_NODE
    if (domNode.nodeType === 3) {
      const text = domNode.nodeValue;
      if (!_trimInstanceProperty(text).call(text) && text !== ' ') {
        return;
      }
      array.push({
        text
      });
      return;
    }

    // ELEMENT_NODE
    if (domNode.nodeType === 1) {
      const tag = domNode.nodeName.toLowerCase();

      // MARKS: <strong>, <em>, etc.
      if (MARK_TAGS[tag]) {
        const markType = MARK_TAGS[tag];
        const children = deserializeElements(Array.from(domNode.childNodes)).map(child => {
          if (child.text !== undefined) {
            return _objectSpread(_objectSpread({}, child), {}, {
              [markType]: true
            });
          }
          return applyMarkToDescendants(child, markType);
        });
        array.push(...children);
        return;
      }

      // BLOCKS: <p>, <h1>, <ul>, <li>, ...
      if (BLOCK_TAGS[tag]) {
        const blockType = BLOCK_TAGS[tag];
        const children = deserializeElements(Array.from(domNode.childNodes));
        if (children.length === 0) {
          children.push({
            text: ''
          });
        }
        array.push({
          type: blockType,
          children
        });
        return;
      }

      // LINK / Inline <a> ?
      if (tag === 'a') {
        const href = domNode.getAttribute('href') || '';
        const children = deserializeElements(Array.from(domNode.childNodes));
        if (children.length === 0) {
          children.push({
            text: href
          });
        }
        array.push({
          type: 'link',
          url: href,
          children
        });
        return;
      }
      const children = deserializeElements(Array.from(domNode.childNodes));
      if (children.length) {
        array.push(...children);
      }
    }
  });
  return array;
}
function deserialize(html) {
  if (!html || typeof html !== 'string') {
    return [{
      type: 'paragraph',
      children: [{
        text: ''
      }]
    }];
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const nodes = deserializeElements(Array.from(doc.body.childNodes));
  return nodes.length > 0 ? nodes : [{
    type: 'paragraph',
    children: [{
      text: ''
    }]
  }];
}
function serialize(nodes) {
  if (!Array.isArray(nodes)) {
    return '';
  }
  return nodes.map(node => serializeNode(node)).join('');
}
export default {
  serialize,
  deserialize
};
//# sourceMappingURL=HTMLSerializer.js.map