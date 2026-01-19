import ExcelJS from 'exceljs';

export default (req, res, _next) => {
  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter();
  const worksheet = workbook.addWorksheet('Members');
  const members = [];
  const columns = [];
  req.stream.on('data', (data) => {
    members.push(data);

    Object.keys(data)
      .filter((key) => !columns.includes(key))
      .forEach((key) => columns.push(key));
  });

  req.stream.on('end', () => {
    worksheet.columns = columns.map((key) => ({ header: key, key, width: 10 }));

    for (const member of members) {
      worksheet.addRow(member).commit();
    }

    workbook.commit();
  });

  workbook.stream.pipe(res);

  res.writeHead(200, {
    'Content-Type':
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'content-disposition': `attachment; filename="contributors.${req.agenda.title}.xlsx"`,
  });
};
