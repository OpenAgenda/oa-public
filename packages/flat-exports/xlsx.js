'use strict';

const ExcelJS = require('exceljs');
const transform = require('./lib/transform');
const clean = require('./lib/xlsx/clean');

function xlsx(_xlsxOptions = {}, inStream, options = {}) {
  const transformed = inStream.pipe(transform(options));

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter();
  const worksheet = workbook.addWorksheet('Events');

  const events = [];

  transformed.on('data', data => {
    events.push(clean(data));
  });

  transformed.on('end', () => {
    worksheet.columns = [...new Set(events.reduce((carry, data) => Object.keys(data).map(key => ({ header: key, key, width: 10 }))))];

    for (const event of events) {
      worksheet.addRow(event).commit();
    }

    workbook.commit();
  });

  return workbook.stream;
}

module.exports = (xlsxOptions = {}) => xlsx.bind(null, xlsxOptions);
