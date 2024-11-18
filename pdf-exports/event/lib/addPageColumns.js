import addPageColumn from './addPageColumn/index.js';

export default async function addPageColumns({ doc, cursor }, columnConfig, options = {}) {
  const { pageWidth = doc.page.width, iconHeightAndWidth, margin, footerHeight, intl, lang } = options;
  const { columns } = columnConfig;

  const widthPerUnit = pageWidth / columns.reduce((t, c) => t + c.width, 0);

  const results = [];

  for (let i = 0; i < columns.length; i++) {
    const column = columns[i];
    const widthUnits = column.width;
    let columnWidth = widthUnits * widthPerUnit;

    let marginLeft = i === 0 ? margin : margin / 2;
    let marginRight = i === 0 ? margin / 2 : margin;

    cursor.x += marginLeft;

    columnWidth -= (marginLeft + marginRight);

    const content = await addPageColumn(doc, cursor, column, { columnWidth, iconHeightAndWidth, margin, footerHeight, intl, lang });
    results.push({ ...column, content });

    cursor.x += columnWidth + marginRight;
  }

  return results;
}