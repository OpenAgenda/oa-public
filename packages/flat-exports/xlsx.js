import { PassThrough } from 'node:stream';
import ExcelJS from 'exceljs';
import transform from './lib/transform/index.js';
import clean from './lib/xlsx/clean.js';

function xlsx(_xlsxOptions, inStream, options = {}) {
  const transformed = inStream.pipe(transform(options));

  const cancelUpstream = (err) => {
    if (!transformed.destroyed) transformed.destroy(err);
    if (!inStream.destroyed) inStream.destroy(err);
  };

  const out = new PassThrough();
  out.once('close', () => cancelUpstream());

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    stream: out,
  });

  const worksheet = workbook.addWorksheet('Events');
  const events = [];

  const fail = (err) => {
    if (out.destroyed) return;
    out.destroy(err);
    cancelUpstream(err);
  };

  inStream.on('error', fail);
  transformed.on('error', fail);

  transformed.on('data', (data) => {
    events.push(clean(data));
  });

  transformed.on('end', async () => {
    try {
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

      worksheet.commit();

      await workbook.commit();
    } catch (err) {
      fail(err);
    }
  });

  return out;
}

export default (xlsxOptions = {}) => xlsx.bind(null, xlsxOptions);
