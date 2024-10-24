import addPageColumn from './addPageColumn/index.js';

export default async function addPageColumns({ doc, cursor }, columnConfig, options = {}) {
  const { pageWidth = doc.page.width, iconHeightAndWidth, margin, lang } = options;
  const { columns } = columnConfig;

  // let currentCursor = { x: initialPosition.x, y: initialPosition.y };

  const widthPerUnit = pageWidth / columns.reduce((t, c) => t + c.width, 0);

  const results = [];

  for (const column of columns) {
    const widthUnits = column.width;
    const columnWidth = widthUnits * widthPerUnit;

    const content = await addPageColumn(doc, cursor, column, { columnWidth, iconHeightAndWidth, margin, lang });
    results.push({ ...column, content });
  }

  return results;
}
