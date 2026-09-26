// The fixed parts of the package around `word/document.xml`. They are small and
// known before the first event, except the document relationships, which list
// every link and picture and so are written last.
import { escape, field, paragraph, run } from './xml.js';

const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const PR = 'http://schemas.openxmlformats.org/package/2006/relationships';
const REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

const declaration = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';

// The namespaces the body uses, declared once on the root.
export const documentNamespaces = [
  `xmlns:w="${W}"`,
  `xmlns:r="${R}"`,
  'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"',
  'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"',
  'xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"',
].join(' ');

export const contentTypes = `${declaration}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Default Extension="jpeg" ContentType="image/jpeg"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
</Types>`;

export const packageRelationships = `${declaration}<Relationships xmlns="${PR}">
<Relationship Id="rId1" Type="${REL}/officeDocument" Target="word/document.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>`;

export function coreProperties({ title, created = new Date() }) {
  return `${declaration}<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<dc:title>${escape(title)}</dc:title>
<dc:creator>OpenAgenda</dc:creator>
<dcterms:created xsi:type="dcterms:W3CDTF">${created.toISOString().replace(/\.\d+Z$/, 'Z')}</dcterms:created>
</cp:coreProperties>`;
}

// `updateFields` makes Word offer to compute the fields (the table of
// contents) when the document opens: the generator cannot, it does not know
// where the pages break.
export function settings({ updateFields }) {
  return `${declaration}<w:settings xmlns:w="${W}">
<w:defaultTabStop w:val="708"/>
<w:characterSpacingControl w:val="doNotCompress"/>
${updateFields ? '<w:updateFields w:val="true"/>\n' : ''}<w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat>
</w:settings>`;
}

export function footer({ title }) {
  return `${declaration}<w:ftr xmlns:w="${W}" xmlns:r="${R}">${paragraph(
    [run(title ? `${title} · ` : ''), field('PAGE', '1')],
    { style: 'Footer' },
  )}</w:ftr>`;
}

// The relationships every document has; links and pictures follow them.
export const fixedDocumentRelationships = [
  { id: 'rId1', type: 'styles', target: 'styles.xml' },
  { id: 'rId2', type: 'settings', target: 'settings.xml' },
  { id: 'rId3', type: 'footer', target: 'footer1.xml' },
];

export function documentRelationships(relationships) {
  const lines = relationships.map(
    ({ id, type, target, external }) =>
      `<Relationship Id="${id}" Type="${REL}/${type}" Target="${escape(target)}"${external ? ' TargetMode="External"' : ''}/>`,
  );

  return `${declaration}<Relationships xmlns="${PR}">\n${lines.join('\n')}\n</Relationships>`;
}

// A4, 2 cm margins: 11906 × 16838 twips, 1134 twips per 2 cm.
export const PAGE = { width: 11906, height: 16838, margin: 1134 };
export const TEXT_WIDTH = PAGE.width - 2 * PAGE.margin;

export function documentStart() {
  return `${declaration}<w:document ${documentNamespaces}><w:body>`;
}

export function documentEnd() {
  return [
    '<w:sectPr>',
    '<w:footerReference w:type="default" r:id="rId3"/>',
    `<w:pgSz w:w="${PAGE.width}" w:h="${PAGE.height}"/>`,
    `<w:pgMar w:top="${PAGE.margin}" w:right="${PAGE.margin}" w:bottom="${PAGE.margin}" w:left="${PAGE.margin}" w:header="567" w:footer="567" w:gutter="0"/>`,
    '</w:sectPr>',
    '</w:body></w:document>',
  ].join('');
}
