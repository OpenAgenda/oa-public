import "core-js/modules/es.regexp.exec.js";
import "core-js/modules/es.string.replace.js";
export function fromPToBR(str) {
  if (typeof str !== 'string') return str;
  return str.split('<p></p>').map(part => part.replace(/<\/p><p>/g, '<br>')).join('');
}
export function fromBRToP(str) {
  if (typeof str !== 'string') return str;
  const parts = str.replace(/<\/p>(\n|)+<p>/g, '<p></p>').split('<p></p>');
  return parts.map(part => part.replace(/<br>/g, '</p><p>')).join('</p><p></p><p>');
}
//# sourceMappingURL=breaksAndParagraphs.js.map