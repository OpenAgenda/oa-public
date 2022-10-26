'use strict';

const ExcelJS = require('exceljs');
const transform = require('./lib/transform');
const clean = require('./lib/xlsx/clean');

function xlsx(_xlsxOptions, inStream, options = {}) {
  const transformed = inStream.pipe(transform(options));

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter();
  const worksheet = workbook.addWorksheet('Events');

  const events = [];

  transformed.on('data', data => {
    events.push(clean(data));
  });

  transformed.on('end', () => {
    worksheet.columns = events.reduce((cols, event) => cols.concat(
      Object.keys(event)
        .filter(key => !cols.find(c => c.key === key))
        .map(key => ({
          header: key,
          key,
          width: 20,
        })),
    ), []);

    for (const event of events) {
      worksheet.addRow(event).commit();
    }

    workbook.commit();
  });

  return workbook.stream;
}

module.exports = (xlsxOptions = {}) => xlsx.bind(null, xlsxOptions);
