// WordprocessingML building blocks. Every function returns a string of XML, and
// every piece of text goes through `escape`: event contents are user input.

// Characters XML 1.0 cannot carry at all, not even escaped (control characters,
// lone surrogates, U+FFFE/FFFF). Word refuses the whole file over one of them.
// eslint-disable-next-line no-control-regex -- matching them is the point
const invalidXmlChars = /[^\x09\x0A\x0D\x20-퟿-�\u{10000}-\u{10FFFF}]/gu;

export function escape(value) {
  return String(value ?? '')
    .replace(invalidXmlChars, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function runProperties({ style, bold, italic } = {}) {
  const props = [
    style ? `<w:rStyle w:val="${style}"/>` : '',
    bold ? '<w:b/>' : '',
    italic ? '<w:i/>' : '',
  ].join('');

  return props ? `<w:rPr>${props}</w:rPr>` : '';
}

// A run of text. Line breaks and tabs in the text become their Word elements,
// so a multi-line description keeps its lines.
export function run(text, options = {}) {
  const content = String(text ?? '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) =>
      line
        .split('\t')
        .map((part) => `<w:t xml:space="preserve">${escape(part)}</w:t>`)
        .join('<w:tab/>'))
    .join('<w:br/>');

  return `<w:r>${runProperties(options)}${content}</w:r>`;
}

// A link around runs already built (formatted text), which should use the
// Hyperlink character style.
export function hyperlinkRuns(relationshipId, runs) {
  return `<w:hyperlink r:id="${relationshipId}" w:history="1">${runs}</w:hyperlink>`;
}

export function hyperlink(relationshipId, text) {
  return hyperlinkRuns(relationshipId, run(text, { style: 'Hyperlink' }));
}

export function paragraph(content, { style, keepNext, pageBreakBefore } = {}) {
  const props = [
    style ? `<w:pStyle w:val="${style}"/>` : '',
    keepNext ? '<w:keepNext/>' : '',
    pageBreakBefore ? '<w:pageBreakBefore/>' : '',
  ].join('');

  return `<w:p>${props ? `<w:pPr>${props}</w:pPr>` : ''}${[].concat(content).join('')}</w:p>`;
}

// A field Word computes itself (a table of contents, a page number). `dirty`
// asks Word to compute it again when the document is opened; `placeholder` is
// what shows until then.
export function field(instruction, placeholder, { dirty = false } = {}) {
  return [
    `<w:r><w:fldChar w:fldCharType="begin"${dirty ? ' w:dirty="true"' : ''}/></w:r>`,
    `<w:r><w:instrText xml:space="preserve"> ${escape(instruction)} </w:instrText></w:r>`,
    '<w:r><w:fldChar w:fldCharType="separate"/></w:r>',
    run(placeholder),
    '<w:r><w:fldChar w:fldCharType="end"/></w:r>',
  ].join('');
}

// EMU (English Metric Units) is the unit of DrawingML: 360000 per centimetre.
export const EMU_PER_CM = 360000;

// A picture in the text flow, `width` × `height` EMU (`size` for a square).
export function inlineImage(
  relationshipId,
  id,
  { size, width = size, height = size, description = '' },
) {
  return [
    '<w:r><w:drawing>',
    '<wp:inline distT="0" distB="0" distL="0" distR="0">',
    `<wp:extent cx="${width}" cy="${height}"/>`,
    '<wp:effectExtent l="0" t="0" r="0" b="0"/>',
    `<wp:docPr id="${id}" name="Picture ${id}" descr="${escape(description)}"/>`,
    '<wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr>',
    '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">',
    '<pic:pic>',
    `<pic:nvPicPr><pic:cNvPr id="${id}" name="image${id}"/><pic:cNvPicPr/></pic:nvPicPr>`,
    `<pic:blipFill><a:blip r:embed="${relationshipId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>`,
    '<pic:spPr>',
    `<a:xfrm><a:off x="0" y="0"/><a:ext cx="${width}" cy="${height}"/></a:xfrm>`,
    '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>',
    '</pic:spPr>',
    '</pic:pic>',
    '</a:graphicData></a:graphic>',
    '</wp:inline>',
    '</w:drawing></w:r>',
  ].join('');
}

const noBorders = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']
  .map((side) => `<w:${side} w:val="nil"/>`)
  .join('');

// A borderless table of one row: the only layout that keeps a picture beside
// its text the same way in Word, LibreOffice and Google Docs. Each cell is
// { width (twips), content (paragraphs) }.
export function borderlessRow(cells) {
  const width = cells.reduce((total, cell) => total + cell.width, 0);

  return [
    '<w:tbl>',
    '<w:tblPr>',
    `<w:tblW w:w="${width}" w:type="dxa"/>`,
    `<w:tblBorders>${noBorders}</w:tblBorders>`,
    '<w:tblLayout w:type="fixed"/>',
    '<w:tblCellMar><w:left w:w="0" w:type="dxa"/><w:right w:w="170" w:type="dxa"/></w:tblCellMar>',
    '<w:tblLook w:val="0000" w:firstRow="0" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="1" w:noVBand="1"/>',
    '</w:tblPr>',
    `<w:tblGrid>${cells.map((cell) => `<w:gridCol w:w="${cell.width}"/>`).join('')}</w:tblGrid>`,
    '<w:tr>',
    ...cells.map((cell) => {
      // A cell must end with a paragraph, even an empty one.
      const content = [].concat(cell.content).join('') || paragraph('');

      return `<w:tc><w:tcPr><w:tcW w:w="${cell.width}" w:type="dxa"/></w:tcPr>${content}</w:tc>`;
    }),
    '</w:tr>',
    '</w:tbl>',
  ].join('');
}
