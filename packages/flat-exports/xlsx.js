import ExcelJS from 'exceljs';
import transform from './lib/transform/index.js';
import clean from './lib/xlsx/clean.js';

function xlsx(_xlsxOptions, inStream, options = {}) {
  const transformed = inStream.pipe(transform(options));

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter();
  const worksheet = workbook.addWorksheet('Events');

  const events = [];

  inStream.on('error', (err) => {
    workbook.stream.destroy(err);
  });

  transformed.on('error', (err) => {
    workbook.stream.destroy(err);
  });

  transformed.on('data', (data) => {
    events.push(clean(data));
  });

  transformed.on('end', () => {
    worksheet.columns = events.reduce(
      (cols, event) =>
        cols.concat(
          Object.keys(event)
            .filter((key) => !cols.find((c) => c.key === key))
            .map((key) => ({
              header: key,
              key,
              width: 20,
            })),
        ),
      [],
    );

    for (const event of events) {
      worksheet.addRow(event).commit();
    }

    workbook.commit();
  });

  return workbook.stream;
}

export default (xlsxOptions = {}) => xlsx.bind(null, xlsxOptions);
