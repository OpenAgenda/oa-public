'use strict';

const ExcelJS = require('exceljs');

module.exports = (req, res, next) => {
  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter();
  const worksheet = workbook.addWorksheet('Members');
  const members = [];
  req.stream.on('data', data => {
    members.push(data);
  });

  req.stream.on('end', () => {
    worksheet.columns = [...new Set(members.reduce((carry, data) => Object.keys(data).map(key => ({ header: key, key, width: 10 }))))];

    for (const member of members) {
      worksheet.addRow(member).commit();
    }

    workbook.commit();
  });

  workbook.stream.pipe(res);

  res.writeHead(200, {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'content-disposition': `attachment; filename="contributors.${req.agenda.title}.xlsx"`
  });
};
