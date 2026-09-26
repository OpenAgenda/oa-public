// The styles of the document. Everything is drawn through named styles, never
// direct formatting, so a user restyles the whole export from Word's style
// pane: change « Event title » once and every event follows.

const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

const TEXT_COLOR = '413A42';
const SECONDARY_COLOR = '6B6B6B';

// Half-points: 20 is 10 pt.
const headingSizes = [30, 26, 24, 22, 21, 20];

export const HEADING_LEVELS = headingSizes.length;

function paragraphStyle({
  id,
  name,
  basedOn = 'Normal',
  next,
  uiPriority,
  keepNext,
  spacing,
  indent,
  justify,
  outlineLevel,
  size,
  bold,
  italic,
  color,
}) {
  const pPr = [
    keepNext ? '<w:keepNext/>' : '',
    spacing
      ? `<w:spacing w:before="${spacing.before ?? 0}" w:after="${spacing.after ?? 0}"/>`
      : '',
    indent ? `<w:ind w:left="${indent}"/>` : '',
    justify ? `<w:jc w:val="${justify}"/>` : '',
    outlineLevel !== undefined ? `<w:outlineLvl w:val="${outlineLevel}"/>` : '',
  ].join('');

  const rPr = [
    bold ? '<w:b/><w:bCs/>' : '',
    italic ? '<w:i/><w:iCs/>' : '',
    color ? `<w:color w:val="${color}"/>` : '',
    size ? `<w:sz w:val="${size}"/><w:szCs w:val="${size}"/>` : '',
  ].join('');

  return [
    `<w:style w:type="paragraph" w:styleId="${id}">`,
    `<w:name w:val="${name}"/>`,
    basedOn && id !== 'Normal' ? `<w:basedOn w:val="${basedOn}"/>` : '',
    next ? `<w:next w:val="${next}"/>` : '',
    uiPriority !== undefined ? `<w:uiPriority w:val="${uiPriority}"/>` : '',
    '<w:qFormat/>',
    pPr ? `<w:pPr>${pPr}</w:pPr>` : '',
    rPr ? `<w:rPr>${rPr}</w:rPr>` : '',
    '</w:style>',
  ].join('');
}

// `eventTitleLevel` is the outline level of the event titles: right under the
// deepest section, so Word's navigation pane nests them in their chapter. The
// table of contents stops above them.
export default function styles({ eventTitleLevel = 0 } = {}) {
  const headings = headingSizes.map((size, index) =>
    paragraphStyle({
      id: `Heading${index + 1}`,
      name: `heading ${index + 1}`,
      next: 'Normal',
      uiPriority: 9,
      keepNext: true,
      spacing: { before: index === 0 ? 480 : 320, after: 120 },
      outlineLevel: index,
      size,
      bold: true,
    }));

  const tocLevels = headingSizes.map((_size, index) =>
    paragraphStyle({
      id: `TOC${index + 1}`,
      name: `toc ${index + 1}`,
      next: 'Normal',
      uiPriority: 39,
      spacing: { after: 60 },
      indent: index * 284,
    }));

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="${W}">
<w:docDefaults>
<w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:color w:val="${TEXT_COLOR}"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr></w:rPrDefault>
<w:pPrDefault><w:pPr><w:spacing w:after="60" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault>
</w:docDefaults>
${[
    paragraphStyle({ id: 'Normal', name: 'Normal' }),
    paragraphStyle({
      id: 'Title',
      name: 'Title',
      next: 'Normal',
      uiPriority: 10,
      spacing: { after: 120 },
      size: 40,
      bold: true,
    }),
    ...headings,
    paragraphStyle({
      id: 'EventTitle',
      name: 'Event title',
      next: 'EventDetail',
      keepNext: true,
      spacing: { before: 240, after: 60 },
      outlineLevel: eventTitleLevel,
      size: 22,
      bold: true,
    }),
    paragraphStyle({
      id: 'EventDetail',
      name: 'Event detail',
      next: 'EventDetail',
      spacing: { after: 40 },
      color: SECONDARY_COLOR,
    }),
    paragraphStyle({
      id: 'EventDescription',
      name: 'Event description',
      next: 'EventDetail',
      spacing: { after: 80 },
    }),
    paragraphStyle({
      id: 'LocationDetail',
      name: 'Location detail',
      next: 'LocationDetail',
      spacing: { after: 40 },
      italic: true,
      color: SECONDARY_COLOR,
    }),
    paragraphStyle({
      id: 'TOCHeading',
      name: 'TOC Heading',
      basedOn: 'Heading1',
      next: 'Normal',
      uiPriority: 39,
      outlineLevel: 9,
    }),
    ...tocLevels,
    paragraphStyle({
      id: 'Footer',
      name: 'footer',
      uiPriority: 99,
      justify: 'center',
      size: 16,
      color: SECONDARY_COLOR,
    }),
  ].join('\n')}
<w:style w:type="character" w:styleId="Hyperlink"><w:name w:val="Hyperlink"/><w:uiPriority w:val="99"/><w:rPr><w:color w:val="0563C1"/><w:u w:val="single"/></w:rPr></w:style>
<w:style w:type="table" w:default="1" w:styleId="TableNormal"><w:name w:val="Normal Table"/><w:uiPriority w:val="99"/><w:semiHidden/><w:tblPr><w:tblInd w:w="0" w:type="dxa"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>
</w:styles>`;
}
